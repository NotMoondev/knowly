import { defineEventHandler } from "h3"
import { db } from "../db/database"

export default defineEventHandler(() => {
  const query = db.query(
    "SELECT username, score, category, difficulty, created_at FROM leaderboard ORDER BY score DESC"
  )
  return { success: true, leaderboard: query.all() }
})
