import { connection } from "next/server";

/** Call at the start of API routes so process.env is read at runtime on Vercel. */
export async function prepareServerRequest(): Promise<void> {
  await connection();
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return secret;
}
