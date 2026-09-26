import { Router } from "express";
import { db } from "../db.js";
import { createTagSchema, createItemSchema, rowToTag } from "../schemas.js";

const router = Router();

router.get("/tags", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  let rows;
  if (q) rows = db.prepare("SELECT * FROM tags WHERE name LIKE ? ORDER BY name").all(`%${q}%`);
  else rows = db.prepare("SELECT * FROM tags ORDER BY name").all();
  res.json({ data: rows.map(rowToTag) });
});

router.post("/tags", (req, res) => {
  const parsed = createTagSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  try {
    const info = db.prepare("INSERT INTO tags (name, color) VALUES (?, ?)").run(parsed.data.name, parsed.data.color);
    const row = db.prepare("SELECT * FROM tags WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ data: rowToTag(row) });
  } catch {
    res.status(409).json({ error: "Tag name already exists" });
  }
});

router.delete("/tags/:id", (req, res) => {
  const info = db.prepare("DELETE FROM tags WHERE id = ?").run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

function itemWithTags(id) {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  if (!item) return null;
  const tags = db
    .prepare("SELECT t.* FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ?")
    .all(id)
    .map(rowToTag);
  return { id: item.id, title: item.title, tags, created_at: item.created_at };
}

router.get("/items", (req, res) => {
  const tag = typeof req.query.tag === "string" ? req.query.tag.trim() : "";
  let ids;
  if (tag) {
    ids = db
      .prepare("SELECT i.id FROM items i JOIN item_tags it ON it.item_id=i.id JOIN tags t ON t.id=it.tag_id WHERE t.name = ? COLLATE NOCASE")
      .all(tag)
      .map((r) => r.id);
  } else {
    ids = db.prepare("SELECT id FROM items ORDER BY created_at DESC").all().map((r) => r.id);
  }
  res.json({ data: ids.map(itemWithTags).filter(Boolean) });
});

router.post("/items", (req, res) => {
  const parsed = createItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  const info = db.prepare("INSERT INTO items (title) VALUES (?)").run(parsed.data.title);
  const link = db.prepare("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)");
  for (const tid of parsed.data.tag_ids) {
    const exists = db.prepare("SELECT id FROM tags WHERE id = ?").get(tid);
    if (exists) link.run(info.lastInsertRowid, tid);
  }
  res.status(201).json({ data: itemWithTags(info.lastInsertRowid) });
});

router.delete("/items/:id", (req, res) => {
  const info = db.prepare("DELETE FROM items WHERE id = ?").run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default router;
