"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronDownIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ReviewsParams } from "@/app/hooks/useReviews";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TYPE_OPTS = ["HOST_TO_GUEST", "GUEST_TO_HOST"] as const;
const CHANNEL_OPTS = ["AIRBNB", "BOOKING", "DIRECT", "UNKNOWN"] as const;
const STATUS_OPTS = ["PUBLISHED", "HIDDEN", "DRAFT"] as const;
const SORT_OPTS = [
	"submittedAt:desc",
	"submittedAt:asc",
	"ratingOverall:desc",
	"ratingOverall:asc",
] as const;

type Props = {
	page: number;
	setPage: (n: number) => void;
	pageSize: number;
	setPageSize: (n: number) => void;
	setParams: (params: ReviewsParams) => void;
	total: number;
	isLoading: boolean;
	isFetching: boolean;
};

function useDebounced<T>(value: T, delay = 300) {
	const [v, setV] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setV(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return v;
}

export default function ReviewsFilters({
	page,
	setPage,
	pageSize,
	setPageSize,
	setParams,
	total,
	isFetching,
	isLoading,
}: Props) {
	// state
	const [q, setQ] = useState("");
	const debouncedQ = useDebounced(q);
	const [listingSlug, setListingSlug] = useState<string>("");

	const [date, setDate] = useState<DateRange | undefined>(undefined);

	const [type, setType] = useState<undefined | (typeof TYPE_OPTS)[number]>();
	const [channel, setChannel] = useState<
		undefined | (typeof CHANNEL_OPTS)[number]
	>();
	const [status, setStatus] = useState<
		undefined | (typeof STATUS_OPTS)[number]
	>();

	const [approved, setApproved] = useState<undefined | boolean>(undefined);
	const [sort, setSort] =
		useState<(typeof SORT_OPTS)[number]>("submittedAt:desc");

	const applyDisabled = isFetching || isLoading;

	// keyboard: Enter submits
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				onApply();
			}
		};
		el.addEventListener("keydown", onKey);
		return () => el.removeEventListener("keydown", onKey);
	}, []);

	// quick presets
	const presets = useMemo(() => {
		const now = new Date();
		const ytd = new Date(now.getFullYear(), 0, 1);
		const daysAgo = (n: number) =>
			new Date(now.getTime() - n * 24 * 3600 * 1000);
		return [
			{ label: "Last 7d", range: { from: daysAgo(7), to: now } },
			{ label: "Last 30d", range: { from: daysAgo(30), to: now } },
			{ label: "Last 90d", range: { from: daysAgo(90), to: now } },
			{ label: "YTD", range: { from: ytd, to: now } },
			{ label: "All time", range: undefined as unknown as DateRange },
		];
	}, []);

	const clearDates = useCallback(
		() => setDate({ from: undefined, to: undefined }),
		[]
	);

	const clearAll = () => {
		setQ("");
		setListingSlug("");
		clearDates();
		setType(undefined);
		setChannel(undefined);
		setStatus(undefined);
		setApproved(undefined);
		setSort("submittedAt:desc");
		setPage(1);
		setPageSize(10);
		setParams({});
	};

	const onApply = () => {
		setParams({
			page,
			pageSize,
			q: debouncedQ || undefined,
			listingSlug: listingSlug || undefined,
			from: date?.from ? date.from.toISOString() : undefined,
			to: date?.to ? date.to.toISOString() : undefined,
			type,
			channel,
			status,
			approved,
			sort,
		});
	};

	// active filter chips
	const chips: Array<{ label: string; onClear: () => void }> = [];
	if (debouncedQ)
		chips.push({ label: `Search: ${debouncedQ}`, onClear: () => setQ("") });
	if (listingSlug)
		chips.push({
			label: `Listing: ${listingSlug}`,
			onClear: () => setListingSlug(""),
		});
	if (date?.from && date?.to)
		chips.push({
			label: `${format(date.from, "d MMM yy")} - ${format(
				date.to,
				"d MMM yy"
			)}`,
			onClear: clearDates,
		});
	if (type)
		chips.push({
			label: `Type: ${type}`,
			onClear: () => setType(undefined),
		});
	if (channel)
		chips.push({
			label: `Channel: ${channel}`,
			onClear: () => setChannel(undefined),
		});
	if (status)
		chips.push({
			label: `Status: ${status}`,
			onClear: () => setStatus(undefined),
		});
	if (approved !== undefined)
		chips.push({
			label: "Approved only",
			onClear: () => setApproved(undefined),
		});
	if (sort && sort !== "submittedAt:desc")
		chips.push({
			label: `Sort: ${sort}`,
			onClear: () => setSort("submittedAt:desc"),
		});

	return (
		<Card className="bg-amber-50/50" ref={containerRef}>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-lg font-semibold flex items-center gap-3">
					Filters
					<Separator orientation="vertical" className="h-5" />
					<span className="text-sm text-muted-foreground">
						{isFetching
							? "Refreshing…"
							: isLoading
							? "Loading…"
							: `${total} result${total === 1 ? "" : "s"}`}
					</span>
				</CardTitle>
				<div className="flex gap-2">
					<Button variant="outline" onClick={clearAll}>
						Reset
					</Button>
					<Button
						onClick={onApply}
						disabled={applyDisabled}
						className="bg-emerald-600 hover:bg-emerald-700"
					>
						{applyDisabled ? "Applying…" : "Apply"}
					</Button>
				</div>
			</CardHeader>

			<CardContent className="flex gap-4 flex-wrap">
				{/* Search */}
				<div className="flex-1 min-w-48">
					<Label className="mb-2" htmlFor="q">
						Search
					</Label>
					<Input
						id="q"
						placeholder="Text or guest name…"
						value={q}
						onChange={(e) => {
							setQ(e.target.value);
							setPage(1);
						}}
						className="bg-white"
					/>
				</div>

				{/* Date range */}
				<div>
					<Label className="mb-2" htmlFor="date">
						Date range
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								id="date"
								className="min-w-48 max-w-56 justify-between font-normal"
								aria-label="Select date range"
							>
								{date?.from && date?.to
									? `${format(
											date.from,
											"d MMM yy"
									  )} - ${format(date.to, "d MMM yy")}`
									: "Select date range"}
								<ChevronDownIcon />
							</Button>
						</PopoverTrigger>

						<PopoverContent
							className="w-auto overflow-hidden p-0"
							align="start"
						>
							<div className="flex flex-col md:flex-row">
								<Calendar
									mode="range"
									selected={date}
									captionLayout="dropdown"
									onSelect={(d) => {
										if (!d) return;
										setDate(d);
									}}
								/>
								<div className="p-3 border-l min-w-[200px] space-y-2">
									<div className="text-sm font-medium">
										Quick presets
									</div>
									<div className="grid grid-cols-2 gap-2">
										{presets.map((p) => (
											<Button
												key={p.label}
												size="sm"
												variant="secondary"
												onClick={() => setDate(p.range)}
											>
												{p.label}
											</Button>
										))}
									</div>
									<Separator className="my-2" />
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={clearDates}
										>
											Clear dates
										</Button>
										<Button size="sm" onClick={onApply}>
											Apply
										</Button>
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>

				{/* Type */}
				<div className="w-36">
					<Label className="mb-2">Type</Label>
					<Select
						value={type ?? ""}
						onValueChange={(v) => {
							if (v === "any") v = "";
							setType(
								(v || undefined) as
									| (typeof TYPE_OPTS)[number]
									| undefined
							);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-full bg-white">
							<SelectValue placeholder="Any" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="any">Any</SelectItem>
							{TYPE_OPTS.map((v) => (
								<SelectItem key={v} value={v}>
									{v}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Channel */}
				<div className="w-36">
					<Label className="mb-2">Channel</Label>
					<Select
						value={channel ?? ""}
						onValueChange={(v) => {
							if (v === "any") v = "";
							setChannel(
								(v || undefined) as
									| (typeof CHANNEL_OPTS)[number]
									| undefined
							);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-full bg-white">
							<SelectValue placeholder="Any" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="any">Any</SelectItem>
							{CHANNEL_OPTS.map((v) => (
								<SelectItem key={v} value={v}>
									{v}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Status */}
				<div className="w-36">
					<Label className="mb-2">Status</Label>
					<Select
						value={status ?? ""}
						onValueChange={(v) => {
							if (v === "any") v = "";
							setStatus(
								(v || undefined) as
									| (typeof STATUS_OPTS)[number]
									| undefined
							);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-full bg-white">
							<SelectValue placeholder="Any" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="any">Any</SelectItem>
							{STATUS_OPTS.map((v) => (
								<SelectItem key={v} value={v}>
									{v}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Sort */}
				<div className="w-36">
					<Label className="mb-2">Sort</Label>
					<Select
						value={sort}
						onValueChange={(v) => {
							setSort(v as (typeof SORT_OPTS)[number]);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-full bg-white">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTS.map((opt) => (
								<SelectItem key={opt} value={opt}>
									{opt}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Page size */}
				<div className="w-36">
					<Label className="mb-2">Page size</Label>
					<Select
						value={String(pageSize)}
						onValueChange={(v) => {
							setPageSize(Number(v));
							setPage(1);
						}}
					>
						<SelectTrigger className="w-full bg-white">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{[10, 20, 50, 100].map((n) => (
								<SelectItem key={n} value={String(n)}>
									{n}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Approved toggle */}
				<div className="flex-col gap-3">
					<div className="mb-4 invisible">
						<Label>Approved</Label>
					</div>
					<div className="flex items-center gap-2">
						<Switch
							className="data-[state=checked]:bg-emerald-600"
							checked={approved === true}
							onCheckedChange={(v) => {
								setApproved(v ? true : undefined);
								setPage(1);
							}}
						/>
						<span className="text-sm font-medium text-muted-foreground">
							Approved only
						</span>
					</div>
				</div>
			</CardContent>

			{/* Active chips */}
			{chips.length ? (
				<CardContent className="pt-0">
					<div className="flex flex-wrap gap-2">
						{chips.map((c, i) => (
							<Badge
								key={i}
								variant="secondary"
								className="gap-1"
							>
								{c.label}
								<button
									type="button"
									className="ml-1 hover:opacity-80"
									aria-label={`Clear ${c.label}`}
									onClick={c.onClear}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				</CardContent>
			) : null}
		</Card>
	);
}
