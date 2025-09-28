// A simple health check endpoint
export async function GET() {
	return new Response("OK", { status: 200 });
}
