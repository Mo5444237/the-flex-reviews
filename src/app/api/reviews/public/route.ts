import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const slug = searchParams.get("listingSlug");
		if (!slug) {
			return NextResponse.json(
				{ error: "listingSlug is required" },
				{ status: 400 }
			);
		}

		const listing = await prisma.listing.findUnique({
			where: { slug },
			select: { id: true, name: true, slug: true },
		});

		if (!listing) {
			return NextResponse.json(
				{ error: "Listing not found" },
				{ status: 404 }
			);
		}

		const reviews = await prisma.review.findMany({
			where: {
				listingId: listing.id,
				isApproved: true,
				status: "PUBLISHED",
			},
			orderBy: { submittedAt: "desc" },
			select: {
				id: true,
				ratingOverall: true,
				submittedAt: true,
				guestName: true,
				publicReview: true,
				categories: { select: { category: true, rating: true } },
			},
			take: 100, // cap for public page
		});

		return NextResponse.json({ listing, items: reviews });
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
