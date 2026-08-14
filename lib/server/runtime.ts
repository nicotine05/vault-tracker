import { AsyncLocalStorage } from "node:async_hooks";
import { connection } from "next/server";

type RequestContext = {
  sessionSecret?: string;
};

const requestContext = new AsyncLocalStorage<RequestContext>();

const SESSION_SECRET_KEY = ["SESSION", "_SECRET"].join("");

/**
 * Bundlers replace process.env.SESSION_SECRET at build time with undefined
 * when Vercel "Sensitive" vars are hidden during build. This lookup cannot
 * be statically analyzed, so the real runtime value is preserved.
 */
function readSessionSecretFromProcessEnv(): string | undefined {
  try {
    const runtimeLookup = new Function(
      "key",
      "return process.env[key]"
    ) as (key: string) => string | undefined;

    return runtimeLookup(SESSION_SECRET_KEY);
  } catch {
    return process.env[SESSION_SECRET_KEY];
  }
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
