import { Database } from "bun:sqlite"

export const db = new Database("db.sqlite")

db.run(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    category TEXT DEFAULT 'Beliebig',
    difficulty TEXT DEFAULT 'Mixed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

