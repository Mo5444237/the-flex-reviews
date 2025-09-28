"use client";
import { useParams } from "next/navigation";

export default function PublicPropertyPage() {
	const { slug } = useParams();
	return (
		<main className="mx-auto max-w-4xl p-6">
			<h1 className="text-2xl font-semibold">Property: {slug}</h1>
			<section className="mt-4">
				<h2 className="text-xl font-medium">Guest Reviews</h2>
				<p className="text-muted-foreground mt-2">
					Only approved reviews will render here.
				</p>
			</section>
		</main>
	);
}
