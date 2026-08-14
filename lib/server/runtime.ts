import { AsyncLocalStorage } from "node:async_hooks";
import { connection } from "next/server";

type RequestContext = {
  sessionSecret?: string;
};

const requestContext = new AsyncLocalStorage<RequestContext>();

const SESSION_SECRET_KEY = ["SESSION", "_SECRET"].join("");

/** Dynamic lookup so Turbopack/Vercel cannot inline an empty build-time value. */
function readSessionSecretFromProcessEnv(): string | undefined {
  return process.env[SESSION_SECRET_KEY];
}

/** Call at the start of API routes so env vars are read at runtime on Vercel. */
export async function prepareServerRequest(): Promise<void> {
  await connection();

  requestContext.enterWith({
    sessionSecret: readSessionSecretFromProcessEnv(),
  });
}

export function getSessionSecret(): string {
  const secret =
    requestContext.getStore()?.sessionSecret ??
    readSessionSecretFromProcessEnv();

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return secret;
}
