"use client";
import { useParams } from "next/navigation";
import { ReviewsPublic } from "../components/ReviewsPublic";

export default function PublicPropertyPage() {
	const { slug } = useParams();
	return <ReviewsPublic slug={slug as string} />;
}
