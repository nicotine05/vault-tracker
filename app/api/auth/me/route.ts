import { NextResponse } from "next/server";
import {
  readSessionToken,
  verifySessionToken,
} from "@/lib/server/session";
import type { AthleteSummary } from "@/lib/server/types";
import {
  findUserById,
  listCoachAthletes,
  toPublicUser,
} from "@/lib/server/users";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = readSessionToken(request.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const payload: {
      user: ReturnType<typeof toPublicUser>;
      athletes?: AthleteSummary[];
    } = {
      user: toPublicUser(user),
    };

    if (user.role === "coach") {
      payload.athletes = await listCoachAthletes(user.id);
    }

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Session lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
