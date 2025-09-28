"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";

type ReviewItem = {
	categories?: { category: string; rating: number }[];
};

function buildCategoryAverages(items: ReviewItem[]) {
	const sums: Record<string, { sum: number; n: number }> = {};
	for (const r of items) {
		for (const c of r.categories ?? []) {
			if (!Number.isFinite(c.rating)) continue;
			if (!sums[c.category]) sums[c.category] = { sum: 0, n: 0 };
			sums[c.category].sum += Number(c.rating);
			sums[c.category].n += 1;
		}
	}
	return Object.entries(sums)
		.map(([category, v]) => ({ category, avg: v.sum / v.n }))
		.sort((a, b) => a.category.localeCompare(b.category));
}

export function CategoryBars({ items }: { items: ReviewItem[] }) {
	const data = buildCategoryAverages(items);
	if (!data.length) return null;

	return (
		<div className="h-64">
			<ResponsiveContainer>
				<BarChart data={data} >
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="category" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="avg" fill="#4caf50" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
