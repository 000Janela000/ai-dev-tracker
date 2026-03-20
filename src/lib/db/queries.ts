import { sql, desc, and, eq, gte, lte, or, ilike } from "drizzle-orm";
import { getDb } from "./client";
import { items, userState } from "./schema";
import type { Category } from "@/lib/types";

export async function getItemsByCategory(
  category: Category,
  limit = 20,
  offset = 0
) {
  const db = getDb();
  return db
    .select()
    .from(items)
    .where(eq(items.category, category))
    .orderBy(desc(items.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getItemsByDateRange(start: Date, end: Date) {
  const db = getDb();
  return db
    .select()
    .from(items)
    .where(and(gte(items.publishedAt, start), lte(items.publishedAt, end)))
    .orderBy(desc(items.publishedAt));
}

export async function getItemsBySource(source: string, limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(items)
    .where(eq(items.source, source))
    .orderBy(desc(items.publishedAt))
    .limit(limit);
}

export async function searchItems(query: string, limit = 50) {
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .select()
    .from(items)
    .where(or(ilike(items.title, pattern), ilike(items.content, pattern)))
    .orderBy(desc(items.publishedAt))
    .limit(limit);
}

export async function getUnsummarizedItems(limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(items)
    .where(sql`${items.summary} IS NULL`)
    .orderBy(desc(items.publishedAt))
    .limit(limit);
}

export async function getRecentItems(limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(items)
    .orderBy(
      sql`${items.significanceScore} DESC NULLS LAST`,
      desc(items.publishedAt)
    )
    .limit(limit);
}

export async function getTrendingItems(limit = 10) {
  const db = getDb();
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return db
    .select()
    .from(items)
    .where(gte(items.publishedAt, twoDaysAgo))
    .orderBy(
      sql`${items.significanceScore} DESC NULLS LAST`,
      desc(items.publishedAt)
    )
    .limit(limit);
}

export async function getWeeklyTopItems(limit = 30) {
  const db = getDb();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(items)
    .where(gte(items.publishedAt, oneWeekAgo))
    .orderBy(
      sql`${items.significanceScore} DESC NULLS LAST`,
      desc(items.publishedAt)
    )
    .limit(limit);
}

export async function getWeeklyCountsByCategory() {
  const db = getDb();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return db
    .select({
      category: items.category,
      count: sql<number>`count(*)::int`,
    })
    .from(items)
    .where(gte(items.publishedAt, oneWeekAgo))
    .groupBy(items.category);
}

export async function getItemById(id: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(items)
    .where(eq(items.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getItemCounts() {
  const db = getDb();
  const result = await db
    .select({
      category: items.category,
      count: sql<number>`count(*)::int`,
    })
    .from(items)
    .groupBy(items.category);
  return result;
}

export async function getRecentItemsExcludingRead(
  userId: string,
  limit = 200
) {
  const db = getDb();
  return db
    .select()
    .from(items)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM ${userState}
        WHERE ${userState.userId} = ${userId}
        AND ${userState.itemId} = ${items.id}
        AND ${userState.action} = 'read'
      )`
    )
    .orderBy(
      sql`${items.significanceScore} DESC NULLS LAST`,
      desc(items.publishedAt)
    )
    .limit(limit);
}
