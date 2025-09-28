"use client";

import {
	useApproveReview,
	useHostawayReviewsResult,
} from "@/app/hooks/useReviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { fmtNumber, labelCat } from "@/lib/format";
import { HoverCardContent } from "@radix-ui/react-hover-card";
import { format } from "date-fns";
import { CircleHelpIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

type props = {
	page: number;
	setPage: (n: number) => void;
	items?: useHostawayReviewsResult["items"];
	total: number;
	pageSize: number;
	isLoading: boolean;
};

const overallFor = (
	r: NonNullable<useHostawayReviewsResult["items"][number]>
) => {
	if (r.ratingOverall != null) return Number(r.ratingOverall);
	const cats = r.categories ?? [];
	if (!cats.length) return null;
	const sum = cats.reduce((a, c) => a + Number(c.rating), 0);
	return sum / cats.length;
};

export default function ReviewsTable({
	page,
	setPage,
	items,
	total,
	pageSize,
	isLoading,
}: props) {
	const approveMut = useApproveReview();
	const pages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<Card className="pt-0">
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table className="w-full text-sm">
						<TableHeader>
							<TableRow>
								<TableHead className="text-left p-3">
									Listing
								</TableHead>
								<TableHead className="text-left p-3">
									Guest
								</TableHead>
								<TableHead className="text-left p-3">
									Review
								</TableHead>
								<TableHead className="text-left p-3">
									Date
								</TableHead>
								<TableHead className="text-left p-3">
									Overall
								</TableHead>
								<TableHead className="text-left p-3">
									Approved
								</TableHead>
								<TableHead className="text-left p-3">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && <TableSkeleton />}
							{items?.map((r) => (
								<TableRow key={r.id} className="border-b">
									<TableCell className="p-3">
										{r.listing?.name}
									</TableCell>
									<TableCell className="p-3">
										{r.guestName}
									</TableCell>
									<TableCell className="p-3">
										{r.publicReview}
									</TableCell>
									<TableCell className="p-3">
										{format(
											new Date(r.submittedAt),
											"dd, MMM yyyy"
										)}
									</TableCell>
									<TableCell className="p-3">
										<HoverCard>
											<HoverCardTrigger asChild>
												<span className="font-medium cursor-help flex items-center gap-1.5">
													{fmtNumber(overallFor(r))}
													<CircleHelpIcon
														size={14}
														className="text-muted-foreground shrink-0"
													/>
												</span>
											</HoverCardTrigger>

											<HoverCardContent className="w-64 bg-white shadow-lg border border-gray-200 rounded-lg p-2">
												<div className="text-sm font-medium mb-2">
													Category breakdown
												</div>
												{r.categories?.length ? (
													<div className="flex flex-wrap gap-2">
														{r.categories.map(
															(c) => (
																<Badge
																	key={
																		c.category
																	}
																	variant="secondary"
																	className="rounded-full"
																>
																	{labelCat(
																		c.category
																	)}
																	: {c.rating}
																</Badge>
															)
														)}
													</div>
												) : (
													<div className="text-sm text-muted-foreground">
														No category scores.
													</div>
												)}
											</HoverCardContent>
										</HoverCard>
									</TableCell>

									<TableCell className="p-3">
										<Switch
											className="data-[state=checked]:bg-emerald-600"
											checked={r.isApproved}
											onCheckedChange={(checked) =>
												approveMut.mutate({
													id: r.id,
													isApproved: checked,
												})
											}
										/>
									</TableCell>
									<TableCell className="p-3">
										<Link
											href={`/properties/${r.listing?.slug}`}
											target="_blank"
											className="text-emerald-600 hover:underline flex items-center"
										>
											<span className="mr-1">Public View</span>
											<ExternalLink
												className="inline-block"
												size={14}
											/>
										</Link>
									</TableCell>
								</TableRow>
							))}

							{!items?.length && !isLoading ? (
								<TableRow>
									<TableCell
										className="p-6 text-center text-muted-foreground"
										colSpan={7}
									>
										No reviews found.
									</TableCell>
								</TableRow>
							) : null}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-center gap-2 p-3">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage(Math.max(1, page - 1))}
					>
						Prev
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {page} / {pages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= pages}
						onClick={() => setPage(Math.min(pages, page + 1))}
					>
						Next
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function TableSkeleton() {
	return (
		<>
			{[...Array(5)].map((_, rowIdx) => (
				<TableRow key={rowIdx}>
					{Array.from({ length: 7 }).map((_, cellIdx) => (
						<TableCell key={cellIdx} className="p-3">
							<div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
						</TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}
