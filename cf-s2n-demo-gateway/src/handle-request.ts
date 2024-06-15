import { RateLimitResponse, rateLimitByIp } from "./ip-ratelimit";

export async function handleRequest(request: Request, env: Env): Promise<Response> {
	const rateLimitResponse = await rateLimitByIp(request, env);

	if (rateLimitResponse === RateLimitResponse.IP_NOT_FOUND) {
		return Response.json(
			{ error: "CF-Connecting-IP header is missing" },
			{ status: 401 }
		);
	}

	if (rateLimitResponse === RateLimitResponse.FAILED) {
		return Response.json({ error: "Failed to check IP limit" }, { status: 500 });
	}

	if (rateLimitResponse === RateLimitResponse.TOO_MANY_REQUESTS) {
		return Response.json({ error: "Too many requests" }, { status: 429 });
	}

	const url = new URL(request.url);
	const path = url.pathname;

	const finalUrl = `${env.TARGET_URL}${path}`;

	const realResponse = await fetch(finalUrl, {
		method: request.method,
		headers: request.headers,
		body: request.body,
	});
	// @ts-ignore
	return new Response(realResponse.body, realResponse);
}
