import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
	Prisma,
	ReviewChannel,
	ReviewStatus,
	ReviewType,
} from "@/generated/prisma";

function buildWhere(params: URLSearchParams) {
	const where: Prisma.ReviewWhereInput = {};

	// Date range
	const from = params.get("from");
	const to = params.get("to");
	if (from || to) {
		where.submittedAt = {};
		if (from) where.submittedAt.gte = new Date(from);
		if (to) where.submittedAt.lte = new Date(to);
	}

	// Listing by id or slug
	const listingId = params.get("listingId");
	const listingSlug = params.get("listingSlug");
	if (listingId) where.listingId = listingId;
	if (listingSlug) where.listing = { slug: listingSlug };

	// Type / Channel / Status / Approved
	const type = params.get("type");
	if (type && type in ReviewType) where.type = type as ReviewType;

	const channel = params.get("channel");
	if (channel && channel in ReviewChannel)
		where.channel = channel as ReviewChannel;

	const status = params.get("status");
	if (status && status in ReviewStatus) where.status = status as ReviewStatus;

	const approved = params.get("approved");
	if (approved === "true") where.isApproved = true;
	if (approved === "false") where.isApproved = false;

	// Text search (guest name or review text)
	const q = params.get("q");
	if (q && q.trim()) {
		where.OR = [
			{ guestName: { contains: q, mode: "insensitive" } },
			{ publicReview: { contains: q, mode: "insensitive" } },
		];
	}

	return where;
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);

		const page = Math.max(1, Number(searchParams.get("page") || 1));
		const pageSize = Math.min(
			100,
			Math.max(1, Number(searchParams.get("pageSize") || 20))
		);
		const skip = (page - 1) * pageSize;

		const sort = searchParams.get("sort") || "submittedAt:desc";
		const [sortField, sortDirRaw] = sort.split(":");
		const sortDir = sortDirRaw?.toLowerCase() === "asc" ? "asc" : "desc";

		const where = buildWhere(searchParams);

		// Parallelize main query + count + aggregates
		const [items, total, byListing, byChannel, byCategory, overall] =
			await Promise.all([
				prisma.review.findMany({
					where,
					orderBy: { [sortField as string]: sortDir },
					skip,
					take: pageSize,
					select: {
						id: true,
						source: true,
						sourceReviewId: true,
						type: true,
						channel: true,
						status: true,
						ratingOverall: true,
						submittedAt: true,
						guestName: true,
						publicReview: true,
						isApproved: true,
						listing: {
							select: { id: true, name: true, slug: true },
						},
						categories: {
							select: { category: true, rating: true },
						},
					},
				}),
				prisma.review.count({ where }),
				prisma.review.groupBy({
					by: ["listingId"],
					where,
					_count: { _all: true },
					_avg: { ratingOverall: true },
				}),
				prisma.review.groupBy({
					by: ["channel"],
					where,
					_count: { _all: true },
				}),
				prisma.reviewCategory.groupBy({
					by: ["category"],
					where: { review: where }, // filter via relation
					_avg: { rating: true },
				}),
				prisma.review.aggregate({
					where,
					_avg: { ratingOverall: true },
				}),
			]);

		const overallAvg =
			overall._avg.ratingOverall != null
				? Number(overall._avg.ratingOverall)
				: null;

		const byListingNormalized = byListing.map((b) => ({
			listingId: b.listingId,
			count: b._count._all,
			avgOverall:
				b._avg.ratingOverall != null
					? Number(b._avg.ratingOverall)
					: null,
		}));

		let derivedOverallAvg: number | null = null;
		if (overallAvg == null) {
			const perReviewMeans: number[] = [];
			for (const r of items) {
				const cats = r.categories ?? [];
				if (cats.length) {
					const sum = cats.reduce(
						(acc: number, c: { rating: number }) =>
							acc + Number(c.rating),
						0
					);
					perReviewMeans.push(sum / cats.length);
				}
			}
			if (perReviewMeans.length) {
				derivedOverallAvg =
					perReviewMeans.reduce((a, b) => a + b, 0) /
					perReviewMeans.length;
			}
		}

		// Enrich listing names for byListing
		const listingIds = byListing.map((b) => b.listingId);
		const listingMap = new Map<string, { name: string; slug: string }>();
		if (listingIds.length) {
			const list = await prisma.listing.findMany({
				where: { id: { in: listingIds } },
				select: { id: true, name: true, slug: true },
			});
			for (const l of list)
				listingMap.set(l.id, { name: l.name, slug: l.slug });
		}

		return NextResponse.json({
			page,
			pageSize,
			total,
			items,
			aggregates: {
				overallAvg: overallAvg ?? derivedOverallAvg ?? null,
				byListing: byListingNormalized.map((b) => ({
					listingId: b.listingId,
					name: listingMap.get(b.listingId)?.name ?? "Unknown",
					slug: listingMap.get(b.listingId)?.slug ?? "",
					count: b.count,
					avgOverall: b.avgOverall,
				})),
				byChannel: byChannel.map((b) => ({
					channel: b.channel,
					count: b._count._all,
				})),
				byCategory: byCategory.map((b) => ({
					category: b.category,
					avg: b._avg.rating ?? null,
				})),
			},
		});
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
