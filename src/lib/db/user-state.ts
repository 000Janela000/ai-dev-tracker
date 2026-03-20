import { sql, and, eq, inArray } from "drizzle-orm";
import { nanoid } from "@/lib/id";
import { getDb } from "./client";
import { userState, items } from "./schema";
import type { ItemRow } from "./schema";

export type UserAction = "read" | "read_later" | "saved";

export async function addUserState(
  userId: string,
  itemId: string,
  action: UserAction
): Promise<void> {
  const db = getDb();
  await db
    .insert(userState)
    .values({ id: nanoid(), userId, itemId, action })
    .onConflictDoNothing();
}

export async function removeUserState(
  userId: string,
  itemId: string,
  action: UserAction
): Promise<void> {
  const db = getDb();
  await db
    .delete(userState)
    .where(
      and(
        eq(userState.userId, userId),
        eq(userState.itemId, itemId),
        eq(userState.action, action)
      )
    );
}

/** Returns a map of itemId → array of actions for the given user */
export async function getUserStatesForItems(
  userId: string,
  itemIds: string[]
): Promise<Map<string, UserAction[]>> {
  if (itemIds.length === 0) return new Map();

  const db = getDb();
  const rows = await db
    .select({ itemId: userState.itemId, action: userState.action })
    .from(userState)
    .where(
      and(eq(userState.userId, userId), inArray(userState.itemId, itemIds))
    );

  const result = new Map<string, UserAction[]>();
  for (const row of rows) {
    const actions = result.get(row.itemId) ?? [];
    actions.push(row.action as UserAction);
    result.set(row.itemId, actions);
  }
  return result;
}

/** Get all items with a specific action for a user, ordered by action date */
export async function getUserItemsByAction(
  userId: string,
  action: UserAction,
  limit = 100
): Promise<(ItemRow & { actionDate: Date })[]> {
  const db = getDb();
  const rows = await db
    .select({
      item: items,
      actionDate: userState.createdAt,
    })
    .from(userState)
    .innerJoin(items, eq(userState.itemId, items.id))
    .where(and(eq(userState.userId, userId), eq(userState.action, action)))
    .orderBy(sql`${userState.createdAt} DESC`)
    .limit(limit);

  return rows.map((r) => ({ ...r.item, actionDate: r.actionDate }));
}
