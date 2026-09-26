import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "tags.db");
const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    color TEXT NOT NULL DEFAULT '#64748b',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS item_tags (
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
`);
if (db.prepare("SELECT COUNT(*) AS c FROM tags").get().c === 0) {
  const t = db.prepare("INSERT INTO tags (name, color) VALUES (?, ?)");
  t.run("frontend", "#38bdf8");
  t.run("api", "#a78bfa");
  t.run("design", "#f472b6");
  const i = db.prepare("INSERT INTO items (title) VALUES (?)");
  const a = i.run("Color Harmony demo");
  const b = i.run("Issues API");
  db.prepare("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)").run(a.lastInsertRowid, 1);
  db.prepare("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)").run(a.lastInsertRowid, 3);
  db.prepare("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)").run(b.lastInsertRowid, 2);
}
console.log("tags.db initialized at", dbPath);
