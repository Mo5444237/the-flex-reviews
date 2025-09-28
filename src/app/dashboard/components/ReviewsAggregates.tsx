import { useHostawayReviewsResult } from "@/app/hooks/useReviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtNumber } from "@/lib/format";
import { BarChart3, Building2, Star } from "lucide-react";

type Props = {
	data?: useHostawayReviewsResult;
};

export default function ReviewsAggregates({ data }: Props) {
	if (!data?.aggregates) return null;

	const { overallAvg, byChannel, byListing } = data.aggregates;
	const maxChannel = Math.max(...byChannel.map((b) => b.count), 1);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			{/* Overall average */}
			<Card className="bg-amber-50/50">
				<CardHeader className="flex items-center gap-2">
					<Star className="h-5 w-5 text-emerald-600" />
					<CardTitle>Overall Avg</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-semibold">
						{fmtNumber(overallAvg)}
					</div>
					<p className="text-sm text-muted-foreground mt-1">
						Across all reviews
					</p>
				</CardContent>
			</Card>

			{/* By channel */}
			<Card className="bg-amber-50/50">
				<CardHeader className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5 text-emerald-600" />
					<CardTitle>By Channel</CardTitle>
				</CardHeader>
				<CardContent>
					{byChannel.length ? (
						<div className="space-y-2 text-sm">
							{byChannel.map((b) => (
								<div key={b.channel}>
									<div className="flex justify-between mb-1">
										<span className="capitalize">
											{b.channel}
										</span>
										<span>{b.count}</span>
									</div>
									<div className="h-1.5 bg-muted rounded-full overflow-hidden">
										<div
											className="h-full bg-emerald-600"
											style={{
												width: `${
													(b.count / maxChannel) * 100
												}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No channel data
						</p>
					)}
				</CardContent>
			</Card>

			{/* Top listings */}
			<Card className="bg-amber-50/50">
				<CardHeader className="flex items-center gap-2">
					<Building2 className="h-5 w-5 text-emerald-600" />
					<CardTitle>Top Listings</CardTitle>
				</CardHeader>
				<CardContent>
					{byListing.length ? (
						<div className="space-y-2 text-sm">
							{byListing.slice(0, 5).map((b) => (
								<div key={b.listingId}>
									<div className="flex justify-between mb-1">
										<span className="truncate max-w-[70%]">
											{b.name}
										</span>
										<span>{b.count}</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No listing data
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
