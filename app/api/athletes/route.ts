import { NextResponse } from "next/server";
import {
  readSessionToken,
  verifySessionToken,
} from "@/lib/server/session";
import {
  createUser,
  findUserByEmail,
  linkCoachAthlete,
  listCoachAthletes,
  toPublicUser,
} from "@/lib/server/users";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = readSessionToken(request.headers.get("cookie"));
    const session = token ? verifySessionToken(token) : null;

    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      athletes: listCoachAthletes(session.userId),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load athletes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = readSessionToken(request.headers.get("cookie"));
    const session = token ? verifySessionToken(token) : null;

    if (!session || session.role !== "coach") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (findUserByEmail(body.email)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const athlete = createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: "athlete",
    });

    linkCoachAthlete(session.userId, athlete.id);

    return NextResponse.json({
      athlete: {
        id: athlete.id,
        name: athlete.name,
        email: athlete.email,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create athlete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
