import { NextResponse } from "next/server";
import { prepareServerRequest } from "@/lib/server/runtime";
import {
  readSessionToken,
  verifySessionToken,
} from "@/lib/server/session";
import { toPublicUser, updateUserTheme } from "@/lib/server/users";
import { isThemeId } from "@/lib/ui/themes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    await prepareServerRequest();
    const token = readSessionToken(request.headers.get("cookie"));
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { theme?: string };

    if (!isThemeId(body.theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    const user = await updateUserTheme(session.userId, body.theme);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: toPublicUser(user),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
