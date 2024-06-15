export async function increaseAndChekIpLimit(
	url: string,
	key: string,
	ip: string
): Promise<number> {
	const response = await fetch(`${url}/ip/s2n-demo`, {
		method: "POST",
		body: JSON.stringify({ ip }),
		headers: {
			"Content-Type": "application/json",
			"X-API-KEY": key,
		},
	});
	if (response.status == 200) {
		const body = await response.json();
		// @ts-ignore
		return body.value;
	}
	throw new Error("Failed to fetch ip count");
}

export async function resetLimiCount(url: string, key: string): Promise<void> {
	const response = await fetch(`${url}/ip/s2n-demo`, {
		method: "DELETE",
		headers: {
			"X-API-KEY": key,
		},
	});
	if (response.status != 200) {
		console.log("Failed to reset count");
	}
}
