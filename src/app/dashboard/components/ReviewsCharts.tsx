import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHostawayReviewsResult } from "@/app/hooks/useReviews";
import { CategoryBars } from "@/components/charts/CategoryBars";
import { TrendLine } from "@/components/charts/TrendLine";

type props = {
	data?: useHostawayReviewsResult;
	isLoading: boolean;
};

export default function ReviewsCharts({ data, isLoading }: props) {
	const items = data?.items;
    
    if (isLoading) return <ChartsSkeleton />;
    
	if (!items || items.length === 0) return null;


	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
			<Card>
				<CardHeader>
					<CardTitle>Monthly Avg Rating</CardTitle>
				</CardHeader>
				<CardContent>
					<TrendLine items={items} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Category Averages</CardTitle>
				</CardHeader>
				<CardContent>
					<CategoryBars items={items} />
				</CardContent>
			</Card>
		</div>
	);
}

function ChartsSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
			<div className="h-64 bg-muted animate-pulse rounded-2xl"></div>
			<div className="h-64 bg-muted animate-pulse rounded-2xl"></div>
		</div>
	);
}
