"use client";

import { usePublicReviews } from "@/app/hooks/useReviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReviewsPublic({ slug }: { slug: string }) {
	const { data, isLoading } = usePublicReviews(slug);
	if (isLoading)
		return (
			<div className="text-sm text-muted-foreground">
				Loading reviews…
			</div>
		);
	if (!data?.items?.length) return "No reviews found.";

	const items = data.items;

	// Simple category averages across approved items
	const categorySums: Record<string, { sum: number; n: number }> = {};
	for (const r of items) {
		for (const c of r.categories ?? []) {
			if (!categorySums[c.category])
				categorySums[c.category] = { sum: 0, n: 0 };
			categorySums[c.category].sum += c.rating;
			categorySums[c.category].n += 1;
		}
	}
	const categoryAvgs = Object.entries(categorySums).map(([k, v]) => [
		k,
		(v.sum / v.n).toFixed(1),
	]);

	return (
		<section className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">
				{data?.listing?.name || slug}
			</h1>
			<h2 className="text-xl font-semibold">Guest Reviews</h2>

			<Card>
				<CardHeader>
					<CardTitle>Category Averages</CardTitle>
				</CardHeader>
				<CardContent className="flex gap-2 flex-wrap">
					{categoryAvgs.map(([cat, avg]) => (
						<span
							key={cat}
							className="px-2 py-1 rounded-full bg-muted text-sm"
						>
							{cat}: {avg}
						</span>
					))}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{items.map((r) => (
					<Card key={r.id} className="h-full">
						<CardHeader>
							<CardTitle className="text-base">
								{r.guestName}{" "}
								<span className="text-muted-foreground font-normal">
									•{" "}
									{new Date(
										r.submittedAt
									).toLocaleDateString()}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap">
								{r.publicReview}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}
