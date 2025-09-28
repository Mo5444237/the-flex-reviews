import {
	$Enums,
	Review,
	ReviewChannel,
	ReviewStatus,
	ReviewType,
} from "@/generated/prisma";
import { Decimal } from "@/generated/prisma/runtime/index-browser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

type aggregateResult = {
	overallAvg: number | null;
	byListing: {
		listingId: string;
		name: string;
		slug: string;
		count: number;
		avgOverall: number | null;
	}[];
	byChannel: {
		channel: string;
		count: number;
	}[];
	byCategory: {
		category: string;
		avg: number | null;
	}[];
};

export type useHostawayReviewsResult = {
	page: number;
	pageSize: number;
	total: number;
	items: (Review & {
		listing: { id: string; name: string; slug: string } | null;
		categories: {
			category: $Enums.ReviewCategoryType;
			rating: number;
		}[];
	})[];
	aggregates: aggregateResult;
};

export type usePublicReviewsResult = {
	listing: {
		id: string;
		name: string;
		slug: string;
	};
	items: {
		id: string;
		ratingOverall: Decimal | null;
		submittedAt: Date;
		guestName: string;
		publicReview: string;
		categories: {
			category: $Enums.ReviewCategoryType;
			rating: number;
		}[];
	}[];
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
			return res.json() as Promise<useHostawayReviewsResult>;
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
			return res.json() as Promise<usePublicReviewsResult>;
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
				qc.setQueryData(
					k,
					(old: usePublicReviewsResult | undefined) => {
						if (!old) return old;
						return {
							...old,
							items: old.items.map((r) =>
								r.id === vars.id
									? { ...r, isApproved: vars.isApproved }
									: r
							),
						};
					}
				);
			}
			return { snapshots };
		},
		onError: (_err, _vars, ctx) => {
			ctx?.snapshots?.forEach(([k, data]) => qc.setQueryData(k, data));
			toast.error("Failed to update approval");
		},
		onSuccess: (_data, vars) => {
			toast.success(
				vars.isApproved
					? "Successfully approved review"
					: "Successfully disapproved review"
			);
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["reviews"] });
			qc.invalidateQueries({ queryKey: ["public-reviews"] });
		},
	});
}
