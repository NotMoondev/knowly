import { defineEventHandler, readBody } from "h3"
import { db } from "../db/database"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, score, category, difficulty } = body

  if (!username || typeof score !== "number" || !difficulty) {
    return { success: false, error: "Invalid data" }
  }

  const stmt = db.prepare(
    "INSERT INTO leaderboard (username, score, category, difficulty) VALUES (?, ?, ?, ?)"
  )
  stmt.run(username, score, category || "Beliebig", difficulty)

  return { success: true, message: "Score gespeichert" }
})
