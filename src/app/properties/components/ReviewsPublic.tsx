"use client";

import { useMemo, useState } from "react";
import { Star, User } from "lucide-react";
import { usePublicReviews } from "@/app/hooks/useReviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fmtNumber } from "@/lib/format";

type Review = {
	id: string;
	submittedAt: string;
	guestName: string;
	publicReview: string;
	ratingOverall: number | null;
	categories?: { category: string; rating: number }[];
};

function perReviewOverall(r: Review): number | null {
	if (r.ratingOverall != null) return Number(r.ratingOverall);
	const cats = r.categories ?? [];
	if (!cats.length) return null;
	const sum = cats.reduce((a, c) => a + Number(c.rating), 0);
	return sum / cats.length;
}

function computeCategoryAvgs(items: Review[]) {
	const sums: Record<string, { sum: number; n: number }> = {};
	for (const r of items) {
		for (const c of r.categories ?? []) {
			if (!sums[c.category]) sums[c.category] = { sum: 0, n: 0 };
			sums[c.category].sum += Number(c.rating);
			sums[c.category].n += 1;
		}
	}
	return Object.entries(sums)
		.map(([k, v]) => ({ category: k, avg: v.sum / v.n }))
		.sort((a, b) => a.category.localeCompare(b.category));
}

function Stars({ value }: { value: number | null }) {
	const v = value ?? 0;
	const full = Math.floor(v / 2); // show out of 5 using /2 if ratings are /10
	const half = v % 2 >= 1 ? 1 : 0;
	return (
		<div className="flex items-center gap-1">
			{Array.from({ length: 5 }).map((_, i) => {
				const filled = i < full;
				const isHalf = i === full && half === 1;
				return (
					<Star
						key={i}
						className={
							"h-4 w-4 " +
							(filled
								? "fill-yellow-500 text-yellow-500"
								: isHalf
								? "fill-yellow-500/50 text-yellow-500/50"
								: "text-muted-foreground")
						}
					/>
				);
			})}
		</div>
	);
}

type SortKey = "newest" | "oldest" | "highest" | "lowest";

// --- component ---
export function ReviewsPublic({ slug }: { slug: string }) {
	const { data, isLoading } = usePublicReviews(slug);

	// Prepare hooks and derived data up front
	const items = useMemo(() => {
		return (data?.items ?? []).map((r) => ({
			...r,
			submittedAt:
				typeof r.submittedAt === "string"
					? r.submittedAt
					: r.submittedAt instanceof Date
					? r.submittedAt.toISOString()
					: String(r.submittedAt),
		})) as Review[];
	}, [data?.items]);

	const overall = useMemo(() => {
		const vals = items
			.map(perReviewOverall)
			.filter((v): v is number => v != null && Number.isFinite(v));
		if (!vals.length) return null;
		return vals.reduce((a, b) => a + b, 0) / vals.length;
	}, [items]);

	const categoryAvgs = useMemo(() => computeCategoryAvgs(items), [items]);

	const [sort, setSort] = useState<SortKey>("newest");
	const [showCount, setShowCount] = useState(6);

	const sorted = useMemo(() => {
		const arr = [...items];
		switch (sort) {
			case "newest":
				arr.sort(
					(a, b) =>
						new Date(b.submittedAt).getTime() -
						new Date(a.submittedAt).getTime()
				);
				break;
			case "oldest":
				arr.sort(
					(a, b) =>
						new Date(a.submittedAt).getTime() -
						new Date(b.submittedAt).getTime()
				);
				break;
			case "highest":
				arr.sort(
					(a, b) =>
						(perReviewOverall(b) ?? -1) -
						(perReviewOverall(a) ?? -1)
				);
				break;
			case "lowest":
				arr.sort(
					(a, b) =>
						(perReviewOverall(a) ?? 1e9) -
						(perReviewOverall(b) ?? 1e9)
				);
				break;
		}
		return arr;
	}, [items, sort]);

	const visible = sorted.slice(0, showCount);

	// Loading / empty
	if (isLoading) {
		return (
			<section className="p-6">
				<div className="mx-auto max-w-5xl">
					<Card className="p-6">
						<div className="animate-pulse space-y-4">
							<div className="h-6 w-64 bg-muted rounded" />
							<div className="h-4 w-48 bg-muted rounded" />
							<div className="h-24 w-full bg-muted rounded" />
						</div>
					</Card>
				</div>
			</section>
		);
	}
	if (!data?.items?.length) {
		return (
			<section className="p-6">
				<div className="mx-auto max-w-2xl text-center space-y-2">
					<h1 className="text-2xl font-semibold">
						{data?.listing?.name || slug}
					</h1>
					<p className="text-muted-foreground">No reviews yet.</p>
				</div>
			</section>
		);
	}

	return (
		<section className="p-6">
			<div className="mx-auto max-w-5xl space-y-8">
				{/* Hero header */}
				<div className="rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 p-6 border">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl font-semibold">
								{data.listing?.name || slug}
							</h1>
							<p className="text-sm text-muted-foreground">
								{items.length} approved review
								{items.length > 1 ? "s" : ""}
							</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-3xl font-semibold">
								{fmtNumber(overall)}
							</div>

							<Stars value={overall} />
						</div>
					</div>

					{/* Category chips */}
					{categoryAvgs.length ? (
						<>
							<Separator className="my-4" />
							<div className="flex flex-wrap gap-2">
								{categoryAvgs.map((c) => (
									<Badge
										key={c.category}
										variant="secondary"
										className="text-sm px-3 py-1 rounded-full"
									>
										{c.category.replaceAll("_", " ")}:{" "}
										{fmtNumber(c.avg)}
									</Badge>
								))}
							</div>
						</>
					) : null}
				</div>

				{/* Controls */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Showing {Math.min(showCount, sorted.length)} of{" "}
						{sorted.length} reviews
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant={sort === "newest" ? "default" : "outline"}
							size="sm"
							onClick={() => setSort("newest")}
						>
							Newest
						</Button>
						<Button
							variant={sort === "oldest" ? "default" : "outline"}
							size="sm"
							onClick={() => setSort("oldest")}
						>
							Oldest
						</Button>
						<Button
							variant={sort === "highest" ? "default" : "outline"}
							size="sm"
							onClick={() => setSort("highest")}
						>
							Highest
						</Button>
						<Button
							variant={sort === "lowest" ? "default" : "outline"}
							size="sm"
							onClick={() => setSort("lowest")}
						>
							Lowest
						</Button>
					</div>
				</div>

				{/* Reviews grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{visible.map((r) => {
						const v = perReviewOverall(r);
						return (
							<Card key={r.id} className="h-full">
								<CardHeader className="flex flex-row items-start justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
											<User className="h-4 w-4 text-muted-foreground" />
										</div>
										<div>
											<CardTitle className="text-base">
												{r.guestName}
											</CardTitle>
											<div className="text-xs text-muted-foreground">
												{new Date(
													r.submittedAt
												).toLocaleDateString()}
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="flex items-center justify-end gap-2">
											<span className="text-sm font-medium">
												{fmtNumber(v)}
											</span>
											<Stars value={v} />
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="whitespace-pre-wrap leading-relaxed">
										{r.publicReview}
									</p>
									{r.categories?.length ? (
										<div className="mt-3 flex flex-wrap gap-2">
											{r.categories.map((c) => (
												<Badge
													key={c.category}
													variant="outline"
													className="rounded-full"
												>
													{c.category.replaceAll(
														"_",
														" "
													)}
													: {fmtNumber(c.rating)}
												</Badge>
											))}
										</div>
									) : null}
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Show more */}
				{showCount < sorted.length ? (
					<div className="flex justify-center">
						<Button
							variant="outline"
							onClick={() =>
								setShowCount((c) =>
									Math.min(sorted.length, c + 6)
								)
							}
						>
							Show more
						</Button>
					</div>
				) : null}
			</div>
		</section>
	);
}
