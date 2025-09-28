import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const body = await req.json().catch(() => ({}));
		const isApproved = Boolean(body?.isApproved);

		const updated = await prisma.review.update({
			where: { id: params.id },
			data: { isApproved },
			select: {
				id: true,
				isApproved: true,
				listingId: true,
			},
		});

		return NextResponse.json(updated);
	} catch (err: any) {
		if (err?.code === "P2025") {
			return NextResponse.json(
				{ error: "Review not found" },
				{ status: 404 }
			);
		}
		console.error(err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
