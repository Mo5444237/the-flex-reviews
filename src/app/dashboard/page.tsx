"use client";

import { useState } from "react";
import { ReviewsParams, useHostawayReviews } from "@/app/hooks/useReviews";
import ReviewsFilters from "./components/ReviewsFilters";
import ReviewsTable from "./components/ReviewsTable";
import ReviewsAggregates from "./components/ReviewsAggregates";

export default function DashboardPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [params, setParams] = useState<ReviewsParams>({});

	const { data, isLoading, isFetching } = useHostawayReviews(params);

	const items = data?.items ?? [];
	const total = data?.total ?? 0;

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-3xl font-semibold text-emerald-600">
				Flex Reviews Dashboard
			</h1>
			<ReviewsFilters
				page={page}
				setPage={setPage}
				pageSize={pageSize}
				setPageSize={setPageSize}
				setParams={setParams}
			/>

			<ReviewsTable
				page={page}
				setPage={setPage}
				items={items}
				total={total}
				pageSize={pageSize}
				isLoading={isLoading || isFetching}
			/>

			<ReviewsAggregates data={data} />
		</div>
	);
}
