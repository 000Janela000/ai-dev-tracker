import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/user";
import {
  addUserState,
  removeUserState,
  getUserStatesForItems,
  type UserAction,
} from "@/lib/db/user-state";

const VALID_ACTIONS: UserAction[] = ["read", "read_later", "saved"];

function isValidAction(action: string): action is UserAction {
  return VALID_ACTIONS.includes(action as UserAction);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { itemId, action } = body as { itemId?: string; action?: string };

  if (!itemId || !action || !isValidAction(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await addUserState(user.id, itemId, action);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { itemId, action } = body as { itemId?: string; action?: string };

  if (!itemId || !action || !isValidAction(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await removeUserState(user.id, itemId, action);
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const itemIds = request.nextUrl.searchParams.get("itemIds")?.split(",") ?? [];
  if (itemIds.length === 0) {
    return NextResponse.json({ states: {} });
  }

  const states = await getUserStatesForItems(user.id, itemIds);
  // Convert Map to plain object for JSON
  const obj: Record<string, UserAction[]> = {};
  for (const [key, val] of states) {
    obj[key] = val;
  }
  return NextResponse.json({ states: obj });
}
