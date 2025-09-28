"use client";

import { ReviewCategoryType } from "@/generated/prisma";
import { Decimal } from "@/generated/prisma/runtime/library";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";

type ReviewItem = {
	submittedAt: Date;
	ratingOverall: Decimal | null;
	categories?: { category: ReviewCategoryType; rating: number }[];
};

function overallForReview(r: ReviewItem): number | null {
	if (r.ratingOverall != null) return Number(r.ratingOverall);
	const cats = r.categories ?? [];
	if (!cats.length) return null;
	const sum = cats.reduce((a, c) => a + Number(c.rating), 0);
	return sum / cats.length;
}

function buildMonthlyAvg(items: ReviewItem[]) {
	const buckets = new Map<
		string,
		{ month: string; sum: number; n: number }
	>();
	for (const r of items) {
		const overall = overallForReview(r);
		if (overall == null || Number.isNaN(overall)) continue;

		const d = new Date(r.submittedAt);
		if (Number.isNaN(d.getTime())) continue;

		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
			2,
			"0"
		)}`;
		const rec = buckets.get(key) ?? { month: key, sum: 0, n: 0 };
		rec.sum += overall;
		rec.n += 1;
		buckets.set(key, rec);
	}
	return [...buckets.values()]
		.map((v) => ({ month: v.month, avg: v.sum / v.n }))
		.sort((a, b) => a.month.localeCompare(b.month));
}

export function TrendLine({ items }: { items: ReviewItem[] }) {
	const data = buildMonthlyAvg(items);
	if (!data.length) return null;

	return (
		<div className="h-64">
			<ResponsiveContainer>
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="month" />
					<YAxis />
					<Tooltip />
					<Line
						type="monotone"
						dataKey="avg"
						dot
						activeDot={{ r: 5 }}
						isAnimationActive={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
