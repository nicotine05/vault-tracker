import { AsyncLocalStorage } from "node:async_hooks";
import { connection } from "next/server";

type RequestContext = {
  sessionSecret?: string;
};

const requestContext = new AsyncLocalStorage<RequestContext>();

/** Avoid static `process.env.SESSION_SECRET` so Next.js cannot bake in an empty build value. */
function readRuntimeEnv(name: string): string | undefined {
  const env = globalThis.process?.env;
  if (!env) {
    return undefined;
  }

  return env[name];
}

function resolveSessionSecret(): string | undefined {
  const key = ["SESSION", "_SECRET"].join("");
  return readRuntimeEnv(key) ?? readRuntimeEnv("VT_SESSION_SECRET");
}

/** Call at the start of API routes so env vars are read at runtime on Vercel. */
export async function prepareServerRequest(): Promise<void> {
  await connection();

  requestContext.enterWith({
    sessionSecret: resolveSessionSecret(),
  });
}

export function getSessionSecret(): string {
  const secret =
    requestContext.getStore()?.sessionSecret ?? resolveSessionSecret();

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return secret;
}
