export async function runWithConcurrency<T>(
	tasks: Array<() => Promise<T>>,
	limit: number,
): Promise<T[]> {
	const results: Array<T | undefined> = new Array(tasks.length);
	let index = 0;

	async function worker() {
		while (index < tasks.length) {
			const i = index++;
			results[i] = await tasks[i]();
		}
	}

	const workers = Array.from({ length: Math.min(limit, tasks.length) }, () =>
		worker(),
	);
	await Promise.all(workers);
	return results as T[];
}
