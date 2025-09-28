"use client";

import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
		</QueryClientProvider>
	);
}
