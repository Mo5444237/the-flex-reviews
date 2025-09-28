import fs from "node:fs";
import path from "node:path";
import {
	PrismaClient,
	ReviewChannel,
	ReviewCategoryType,
	ReviewSource,
	ReviewStatus,
	ReviewType,
} from "@/generated/prisma";

const prisma = new PrismaClient();

type HostawayCategory = {
	category: string;
	rating: number;
};

type HostawayReview = {
	id: string;
	listingId?: string | number | null;
	listingName?: string | null;
	type?: string | null;
	status?: string | null;
	rating?: number | null;
	reviewCategory?: HostawayCategory[];
	submittedAt: string;
	guestName?: string | null;
	publicReview?: string | null;
	channel?: string | null;
};

type HostawayJson = {
	result: HostawayReview[];
};

// Slugify listing names for URL slugs (e.g. "My Listing #1!" -> "my-listing-1")
function slugify(input: string) {
	return input
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 64);
}

// Map Hostaway strings to our enums
function mapType(t?: string | null): ReviewType {
	switch ((t || "").toLowerCase()) {
		case "host-to-guest":
			return ReviewType.HOST_TO_GUEST;
		case "guest-to-host":
			return ReviewType.GUEST_TO_HOST;
		default:
			return ReviewType.HOST_TO_GUEST;
	}
}

// Maps Hostaway status strings to our ReviewStatus enum
function mapStatus(s?: string | null): ReviewStatus {
	switch ((s || "").toLowerCase()) {
		case "published":
			return ReviewStatus.PUBLISHED;
		case "hidden":
			return ReviewStatus.HIDDEN;
		case "draft":
			return ReviewStatus.DRAFT;
		default:
			return ReviewStatus.PUBLISHED;
	}
}

// Maps Hostaway channel strings to our ReviewChannel enum
function mapChannel(c?: string | null): ReviewChannel {
	switch ((c || "").toLowerCase()) {
		case "airbnb":
			return ReviewChannel.AIRBNB;
		case "booking":
		case "booking.com":
			return ReviewChannel.BOOKING;
		case "direct":
			return ReviewChannel.DIRECT;
		default:
			return ReviewChannel.UNKNOWN;
	}
}

// Maps Hostaway category strings to our ReviewCategoryType enum
function mapCategory(cat: string): ReviewCategoryType | null {
	const k = cat.toLowerCase().replace(/\s+/g, "_");
	switch (k) {
		case "cleanliness":
			return ReviewCategoryType.CLEANLINESS;
		case "communication":
			return ReviewCategoryType.COMMUNICATION;
		case "accuracy":
			return ReviewCategoryType.ACCURACY;
		case "checkin":
		case "check_in":
		case "check-in":
			return ReviewCategoryType.CHECKIN;
		case "location":
			return ReviewCategoryType.LOCATION;
		case "value":
			return ReviewCategoryType.VALUE;
		case "respect_house_rules":
		case "house_rules":
		case "respect_house_rules_":
			return ReviewCategoryType.RESPECT_HOUSE_RULES;
		default:
			return ReviewCategoryType.OTHER;
	}
}

// Normalize date strings from Hostaway to Date objects
function parseHostawayDate(s?: unknown): Date | null {
	if (!s || typeof s !== "string") return null;
	const trimmed = s.trim();
	const isoish = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
	const withZ = /Z$/.test(isoish) ? isoish : isoish + "Z";
	const d = new Date(withZ);
	return Number.isNaN(d.getTime()) ? null : d;
}

async function upsertListingFromReview(r: HostawayReview) {
	const name = r.listingName?.trim() || "Unknown Listing";
	const hostawayListingId = r.listingId ? String(r.listingId) : null;
	const slug = slugify(name);

	// prefer hostawayListingId when present, otherwise on name
	if (hostawayListingId) {
		const existingByHA = await prisma.listing.findFirst({
			where: { hostawayListingId },
			select: { id: true },
		});
		if (existingByHA) return existingByHA.id;
	}

	// try name/slug
	const existingBySlug = await prisma.listing.findFirst({
		where: { slug },
		select: { id: true },
	});
	if (existingBySlug) {
		// backfill hostawayListingId if missing and we now have one
		if (hostawayListingId) {
			await prisma.listing.update({
				where: { id: existingBySlug.id },
				data: { hostawayListingId },
			});
		}
		return existingBySlug.id;
	}

	const created = await prisma.listing.create({
		data: {
			name,
			slug,
			hostawayListingId: hostawayListingId || null,
		},
		select: { id: true },
	});
	return created.id;
}

async function main() {
	const jsonPath =
		process.env.HOSTAWAY_JSON_PATH ||
		path.resolve(process.cwd(), "data", "hostaway-sample.json");

	if (!fs.existsSync(jsonPath)) {
		console.error(
			`Seed file not found at ${jsonPath}\n` +
				`Provide the mock JSON at /data/hostaway-sample.json or set HOSTAWAY_JSON_PATH.`
		);
		process.exit(1);
	}

	const raw = fs.readFileSync(jsonPath, "utf-8");
	const parsed: HostawayJson | HostawayReview[] = JSON.parse(raw);

	const items: HostawayReview[] = Array.isArray(parsed)
		? parsed
		: parsed.result ?? [];

	if (!items.length) {
		console.warn("No items found in the seed JSON. Nothing to seed.");
		return;
	}

	console.log(`Found ${items.length} reviews to process…`);

	let created = 0;
	let updated = 0;

	for (const r of items) {
		try {
			const listingId = await upsertListingFromReview(r);

			// Map fields
			const source = ReviewSource.HOSTAWAY;
			const sourceReviewId = String(r.id);
			const type = mapType(r.type);
			const status = mapStatus(r.status);
			const channel = mapChannel(r.channel);
			const submittedAt = parseHostawayDate(r.submittedAt);

			if (!submittedAt) {
				console.warn(
					`Skipping review ${r.id}: invalid submittedAt`,
					r.submittedAt
				);
				continue;
			}

			const ratingOverall =
				r.rating === null || r.rating === undefined
					? null
					: Number(r.rating);
			const guestName = (r.guestName || "Guest").slice(0, 200);
			const publicReview = (r.publicReview || "").trim();

			// counter check
			const existing = await prisma.review.findUnique({
				where: {
					source_sourceReviewId: { source, sourceReviewId },
				},
				select: { id: true },
			});

			// Upsert review (unique on source + sourceReviewId)
			const review = await prisma.review.upsert({
				where: {
					source_sourceReviewId: {
						source,
						sourceReviewId,
					},
				},
				update: {
					listingId,
					type,
					channel,
					status,
					ratingOverall,
					submittedAt,
					guestName,
					publicReview,
					// keep isApproved as-is if already toggled by a manager
				},
				create: {
					source,
					sourceReviewId,
					listingId,
					type,
					channel,
					status,
					ratingOverall,
					submittedAt,
					guestName,
					publicReview,
					isApproved: false,
				},
				select: { id: true },
			});

			if (!existing) {
				created += 1;
			} else {
				updated += 1;
			}

			// Replace categories for this review (simple approach)
			await prisma.reviewCategory.deleteMany({
				where: { reviewId: review.id },
			});

			const cats = (r.reviewCategory || [])
				.map((c) => ({
					reviewId: review.id,
					category:
						mapCategory(c.category) ?? ReviewCategoryType.OTHER,
					rating: Math.round(Number(c.rating)),
				}))
				.filter((c) => Number.isFinite(c.rating)); // filter NaN/invalid

			if (cats.length) {
				await prisma.reviewCategory.createMany({
					data: cats,
					skipDuplicates: true,
				});
			}
		} catch (e) {
			console.error("Error processing review:", r.id, e);
		}
	}

	console.log(
		`Seed completed. Created: ${created}, Updated: ${updated}, Total: ${items.length} reviews.`
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
