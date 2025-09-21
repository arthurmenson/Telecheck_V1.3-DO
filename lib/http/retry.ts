export async function withRetry<T>(fn: () => Promise<T>, tries = 3) {
  let err: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 200));
    }
  }
  throw err;
}
