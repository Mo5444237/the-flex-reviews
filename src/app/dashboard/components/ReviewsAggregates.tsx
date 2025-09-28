import { useHostawayReviewsResult } from "@/app/hooks/useReviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type props = {
	data?: useHostawayReviewsResult;
};

export default function ReviewsAggregates({ data }: props) {
	if (!data?.aggregates) return null;

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Card className="bg-amber-50/50">
				<CardHeader>
					<CardTitle>Overall Avg</CardTitle>
				</CardHeader>
				<CardContent className="text-2xl">
					{data.aggregates.overallAvg ?? "—"}
				</CardContent>
			</Card>
			<Card className="bg-amber-50/50">
				<CardHeader>
					<CardTitle>By Channel</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-1 text-sm">
						{data.aggregates.byChannel.map(
							(b: { channel: string; count: number }) => (
								<div
									key={b.channel}
									className="flex justify-between"
								>
									<span>{b.channel}</span>
									<span>{b.count}</span>
								</div>
							)
						)}
					</div>
				</CardContent>
			</Card>
			<Card className="bg-amber-50/50">
				<CardHeader>
					<CardTitle>Top Listings</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-1 text-sm">
						{data.aggregates.byListing
							.slice(0, 5)
							.map(
								(b: {
									listingId: string;
									name: string;
									count: number;
								}) => (
									<div
										key={b.listingId}
										className="flex justify-between"
									>
										<span>{b.name}</span>
										<span>{b.count}</span>
									</div>
								)
							)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
