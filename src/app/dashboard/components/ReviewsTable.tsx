"use client";

import {
	useApproveReview,
	useHostawayReviewsResult,
} from "@/app/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type props = {
	page: number;
	setPage: (n: number) => void;
	items?: useHostawayReviewsResult["items"];
	total: number;
	pageSize: number;
	isLoading: boolean;
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
										{r.ratingOverall
											? r.ratingOverall.toString()
											: "—"}
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
											<span className="mr-1">View</span>
											<ExternalLink
												className="inline-block"
												size={14}
											/>
										</Link>
									</TableCell>
								</TableRow>
							))}

							{!items?.length && !isLoading ? (
								<tr>
									<td
										className="p-6 text-center text-muted-foreground"
										colSpan={6}
									>
										No reviews found.
									</td>
								</tr>
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
