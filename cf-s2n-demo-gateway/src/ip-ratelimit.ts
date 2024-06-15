import { increaseAndChekIpLimit } from "./utils";

export enum RateLimitResponse {
	OK = 0,
	TOO_MANY_REQUESTS = 1,
	IP_NOT_FOUND = 2,
	FAILED = 3,
}

export async function rateLimitByIp(
	request: Request,
	env: Env
): Promise<RateLimitResponse> {
	const ip = request.headers.get("cf-connecting-ip");

	if (!ip) {
		return RateLimitResponse.IP_NOT_FOUND;
	}

	// get ipcount or 0
	try {
		const count = await increaseAndChekIpLimit(
			env.RATELIMIT_SERVER_URL,
			env.RATELIMIT_SERVER_KEY,
			ip
		);

		console.log(`IP: ${ip} has ${count} requests`);

		if (count >= env.GENERIC_REQ_PER_DAY) {
			return RateLimitResponse.TOO_MANY_REQUESTS;
		}

		return RateLimitResponse.OK;
	} catch (error) {
		console.error(error);
		return RateLimitResponse.FAILED;
	}
}
