import {
	Prisma,
	Review,
	ReviewChannel,
	ReviewStatus,
	ReviewType,
} from "@/generated/prisma";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ReviewsParams = {
	page?: number;
	pageSize?: number;
	from?: string;
	to?: string;
	listingSlug?: string;
	type?: ReviewType;
	channel?: ReviewChannel;
	status?: ReviewStatus;
	approved?: boolean;
	q?: string;
	sort?: string;
};

function toQS(params: ReviewsParams) {
	const u = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v === undefined || v === null || v === "") return;
		u.set(k, String(v));
	});
	return u.toString();
}

export function useHostawayReviews(params: ReviewsParams) {
	const qs = toQS(params);
	return useQuery({
		queryKey: ["reviews", qs],
		queryFn: async () => {
			const res = await fetch(`/api/reviews/hostaway?${qs}`, {
				cache: "no-store",
			});
			if (!res.ok) throw new Error("Failed to load reviews");
			return res.json() as Promise<{
				page: number;
				pageSize: number;
				total: number;
				items: Review[];
				aggregates: Prisma.AggregateReview;
			}>;
		},
		placeholderData: (previousData) => previousData,
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});
}

export function usePublicReviews(listingSlug: string) {
	return useQuery({
		queryKey: ["public-reviews", listingSlug],
		queryFn: async () => {
			const res = await fetch(
				`/api/reviews/public?listingSlug=${encodeURIComponent(
					listingSlug
				)}`,
				{ cache: "no-store" }
			);
			if (!res.ok) throw new Error("Failed to load public reviews");
			return res.json() as Promise<{ listing: any; items: any[] }>;
		},
		enabled: !!listingSlug,
		staleTime: 60_000,
	});
}

export function useApproveReview() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			isApproved,
		}: {
			id: string;
			isApproved: boolean;
		}) => {
			const res = await fetch(`/api/reviews/${id}/approve`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isApproved }),
			});
			if (!res.ok) throw new Error("Failed to update approval");
			return res.json();
		},
		onMutate: async (vars) => {
			const keys = qc
				.getQueryCache()
				.findAll()
				.map((e) => e.queryKey)
				.filter((k) => Array.isArray(k) && k[0] === "reviews");
			const snapshots = keys.map((k) => [k, qc.getQueryData(k)] as const);
			for (const k of keys) {
				qc.setQueryData(k, (old: any) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.map((r: any) =>
							r.id === vars.id
								? { ...r, isApproved: vars.isApproved }
								: r
						),
					};
				});
			}
			return { snapshots };
		},
		onError: (_err, _vars, ctx) => {
			ctx?.snapshots?.forEach(([k, data]) => qc.setQueryData(k, data));
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["reviews"] });
			qc.invalidateQueries({ queryKey: ["public-reviews"] });
		},
	});
}
