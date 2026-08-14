/** Read server env at runtime (avoids build-time inlining on Vercel). */
export function getServerEnv(name: string): string | undefined {
  return process.env[name];
}

export function requireServerEnv(name: string): string {
  const value = getServerEnv(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}
