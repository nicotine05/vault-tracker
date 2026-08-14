import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/server/auth";
import {
  buildSessionCookie,
  createSessionToken,
} from "@/lib/server/session";
import { findUserByEmail, toPublicUser } from "@/lib/server/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(body.email);
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id, user.role);
    const response = NextResponse.json({ user: toPublicUser(user) });
    response.headers.set("Set-Cookie", buildSessionCookie(token));

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
