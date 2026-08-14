import { NextResponse } from "next/server";
import { prepareServerRequest } from "@/lib/server/runtime";
import {
  buildSessionCookie,
  createSessionToken,
} from "@/lib/server/session";
import {
  createUser,
  findUserByEmail,
  linkCoachAthlete,
  toPublicUser,
} from "@/lib/server/users";
import type { UserRole } from "@/lib/server/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await prepareServerRequest();
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      role?: UserRole;
      coachId?: string;
    };

    if (!body.email || !body.password || !body.name || !body.role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    if (body.role !== "coach" && body.role !== "athlete") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (await findUserByEmail(body.email)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = await createUser({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });

    if (body.role === "athlete" && body.coachId) {
      await linkCoachAthlete(body.coachId, user.id);
    }

    const token = createSessionToken(user.id, user.role);
    const response = NextResponse.json({ user: toPublicUser(user) });
    response.headers.set("Set-Cookie", buildSessionCookie(token));

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
