import { handleRequest } from "./handle-request";
import { resetLimiCount } from "./utils";

const getCorsHeaders = (allowedOrigin: string) => ({
	"Access-Control-Allow-Origin": allowedOrigin,
	"Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	"Access-Control-Max-Age": "86400",
});

/**
 * Check the origin for this request
 * If it is included in our set of known and allowed origins, return it, otherwise
 * return a known, good origin. This effectively does not allow browsers to
 * continue requests if the origin they're requesting from doesn't match.
 */
const checkOrigin = (request: Request, allowedOrigins: string[]) => {
	const origin = request.headers.get("Origin");

	if (origin === null) {
		return allowedOrigins[0];
	}
	const foundOrigin = allowedOrigins.find((allowedOrigin) =>
		allowedOrigin.includes(origin)
	);

	return foundOrigin ? foundOrigin : allowedOrigins[0];
};

async function handleOptions(request: Request, env: Env): Promise<Response> {
	const allowedOrigins = env.ALLOWED_ORIGIN.split(",");

	const allowedOrigin = checkOrigin(request, allowedOrigins);
	return new Response("OK", { headers: getCorsHeaders(allowedOrigin) });
}

async function handleRequestWithCors(request: Request, env: Env): Promise<Response> {
	if (request.method === "OPTIONS") {
		return handleOptions(request, env);
	} else {
		const allowedOrigins = env.ALLOWED_ORIGIN.split(",");
		const allowedOrigin = checkOrigin(request, allowedOrigins);
		const corsHeaders = getCorsHeaders(allowedOrigin);

		let response = await handleRequest(request, env);

		for (const [header, value] of Object.entries(corsHeaders)) {
			response.headers.set(header, value);
		}

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
