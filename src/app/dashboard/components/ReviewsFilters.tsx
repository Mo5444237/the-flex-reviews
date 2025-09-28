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
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ReviewsParams } from "@/app/hooks/useReviews";

const TYPE_OPTS = ["HOST_TO_GUEST", "GUEST_TO_HOST"] as const;
const CHANNEL_OPTS = ["AIRBNB", "BOOKING", "DIRECT", "UNKNOWN"] as const;
const STATUS_OPTS = ["PUBLISHED", "HIDDEN", "DRAFT"] as const;
const SORT_OPTS = [
	"submittedAt:desc",
	"submittedAt:asc",
	"ratingOverall:desc",
	"ratingOverall:asc",
] as const;

type props = {
	page: number;
	setPage: (n: number) => void;
	pageSize: number;
	setPageSize: (n: number) => void;
	setParams: (params: ReviewsParams) => void;
};

export default function ReviewsFilters({
	page,
	setPage,
	pageSize,
	setPageSize,
	setParams,
}: props) {
	const [q, setQ] = useState("");
	const [listingSlug, setListingSlug] = useState<string>("");

	const [date, setDate] = useState<DateRange | undefined>(undefined);

	const [type, setType] = useState<undefined | (typeof TYPE_OPTS)[number]>(
		undefined
	);
	const [channel, setChannel] = useState<
		undefined | (typeof CHANNEL_OPTS)[number]
	>(undefined);
	const [status, setStatus] = useState<
		undefined | (typeof STATUS_OPTS)[number]
	>(undefined);

	const [approved, setApproved] = useState<undefined | boolean>(undefined);

	const [sort, setSort] =
		useState<(typeof SORT_OPTS)[number]>("submittedAt:desc");

	const clearAll = () => {
		setQ("");
		setListingSlug("");
		setDate({ from: undefined, to: undefined });
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
			q: q || undefined,
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

	return (
		<Card className="bg-amber-50/50">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-lg font-semibold">Filters</CardTitle>
				<div className="flex gap-2">
					<Button variant="outline" onClick={clearAll}>
						Reset
					</Button>
					<Button
						onClick={onApply}
						className="bg-emerald-600 hover:bg-emerald-700"
					>
						Apply
					</Button>
				</div>
			</CardHeader>

			<CardContent className="flex gap-4 flex-wrap ">
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

				<div className="w-48">
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
							<Calendar
								mode="range"
								selected={date}
								captionLayout="dropdown"
								onSelect={(date) => {
									if (date && date.from && date.to) {
										setDate(date);
									}
								}}
							/>
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
							<SelectItem value={"any"}>Any</SelectItem>
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
							<SelectItem value={"any"}>Any</SelectItem>
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
							<SelectItem value={"any"}>Any</SelectItem>
							{STATUS_OPTS.map((v) => (
								<SelectItem key={v} value={v}>
									{v}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Sort */}
				<div className="">
					<Label className="mb-2">Sort</Label>
					<Select
						value={sort}
						onValueChange={(v) => {
							setSort(v as (typeof SORT_OPTS)[number]);
							setPage(1);
						}}
					>
						<SelectTrigger className="w-48 bg-white">
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

				{/* Counter */}
				{/* <div className="flex items-end justify-end">
						<span className="text-sm text-muted-foreground">
							{isFetching
								? "Refreshing…"
								: isLoading
								? "Loading…"
								: `${total} results`}
						</span>
					</div> */}
			</CardContent>
		</Card>
	);
}
