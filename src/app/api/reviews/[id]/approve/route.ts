import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function PATCH(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		const body = await req.json().catch(() => ({}));
		const isApproved = Boolean(body?.isApproved);

		const updated = await prisma.review.update({
			where: { id: id },
			data: { isApproved },
			select: {
				id: true,
				isApproved: true,
				listingId: true,
			},
		});

		return NextResponse.json(updated);
	} catch (err) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err?.code === "P2025"
		) {
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
