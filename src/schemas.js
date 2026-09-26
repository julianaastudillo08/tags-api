import { z } from "zod";
export const createTagSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#64748b"),
});
export const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  tag_ids: z.array(z.number().int().positive()).max(20).optional().default([]),
});
export function rowToTag(row) {
  return { id: row.id, name: row.name, color: row.color, created_at: row.created_at };
}
