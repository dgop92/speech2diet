import { handleRequest } from "./handle-request";
import { resetLimiCount } from "./utils";

const getCorsHeaders = (allowedOrigin: string) => ({
	"Access-Control-Allow-Origin": allowedOrigin,
	"Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	"Access-Control-Max-Age": "86400",
});

async function handleOptions(request: Request, env: Env): Promise<Response> {
	const corsHeaders = getCorsHeaders(env.ALLOWED_ORIGIN);

	if (
		request.headers.get("Origin") !== null &&
		request.headers.get("Access-Control-Request-Method") !== null &&
		request.headers.get("Access-Control-Request-Headers") !== null
	) {
		return new Response(null, {
			headers: {
				...corsHeaders,
				// @ts-ignore
				"Access-Control-Allow-Headers": request.headers.get(
					"Access-Control-Request-Headers"
				),
			},
		});
	} else {
		// Handle standard OPTIONS request.
		return new Response(null, {
			headers: {
				Allow: corsHeaders["Access-Control-Allow-Methods"],
			},
		});
	}
}

async function handleRequestWithCors(request: Request, env: Env): Promise<Response> {
	if (request.method === "OPTIONS") {
		return handleOptions(request, env);
	} else {
		const corsHeaders = getCorsHeaders(env.ALLOWED_ORIGIN);

		let response = await handleRequest(request, env);

		response.headers.set("Access-Control-Allow-Origin", env.ALLOWED_ORIGIN);
		response.headers.set(
			"Access-Control-Allow-Methods",
			corsHeaders["Access-Control-Allow-Methods"]
		);
		// @ts-ignore
		return Promise.resolve(response);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequestWithCors(request, env);
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		console.log("resetting limit count");
		await resetLimiCount(env.RATELIMIT_SERVER_URL, env.RATELIMIT_SERVER_KEY);
	},
};
