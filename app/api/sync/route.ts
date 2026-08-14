import { NextResponse } from "next/server";
import {
  readSessionToken,
  verifySessionToken,
} from "@/lib/server/session";
import {
  loadAthleteSync,
  resolveSyncAthleteId,
  saveAthleteSync,
} from "@/lib/server/users";

export const runtime = "nodejs";

function getRequestedAthleteId(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("athleteId");
}

export async function GET(request: Request) {
  try {
    const token = readSessionToken(request.headers.get("cookie"));
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await resolveSyncAthleteId({
      sessionUserId: session.userId,
      sessionRole: session.role,
      requestedAthleteId: getRequestedAthleteId(request),
    });

    if ("error" in resolved) {
      return NextResponse.json(
        { error: resolved.error },
        { status: resolved.status }
      );
    }

    const sync = await loadAthleteSync(resolved.athleteId);

    return NextResponse.json({
      athleteId: resolved.athleteId,
      data: sync.data,
      updatedAt: sync.updatedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync pull failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = readSessionToken(request.headers.get("cookie"));
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await resolveSyncAthleteId({
      sessionUserId: session.userId,
      sessionRole: session.role,
      requestedAthleteId: getRequestedAthleteId(request),
    });

    if ("error" in resolved) {
      return NextResponse.json(
        { error: resolved.error },
        { status: resolved.status }
      );
    }

    const body = (await request.json()) as {
      data?: Record<string, unknown>;
      clientUpdatedAt?: string | null;
      force?: boolean;
    };

    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json({ error: "Missing sync data" }, { status: 400 });
    }

    const existing = await loadAthleteSync(resolved.athleteId);

    if (
      !body.force &&
      existing.updatedAt &&
      body.clientUpdatedAt &&
      existing.updatedAt > body.clientUpdatedAt
    ) {
      return NextResponse.json(
        {
          error: "Remote data is newer",
          updatedAt: existing.updatedAt,
        },
        { status: 409 }
      );
    }

    const updatedAt = await saveAthleteSync(resolved.athleteId, body.data);

    return NextResponse.json({ ok: true, updatedAt });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync push failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
