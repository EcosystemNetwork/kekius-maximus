import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { GameState, PlayerRecord } from "./game/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "..", "data", "ludus.db");

mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    telegram_id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT NOT NULL,
    state_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

type Row = {
  telegram_id: number;
  username: string | null;
  first_name: string;
  state_json: string;
  created_at: number;
  updated_at: number;
};

function rowToPlayer(row: Row): PlayerRecord {
  return {
    telegramId: row.telegram_id,
    username: row.username,
    firstName: row.first_name,
    state: JSON.parse(row.state_json) as GameState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getPlayer(telegramId: number): PlayerRecord | null {
  const row = db
    .prepare("SELECT * FROM players WHERE telegram_id = ?")
    .get(telegramId) as Row | undefined;
  return row ? rowToPlayer(row) : null;
}

export function savePlayer(player: PlayerRecord): void {
  db.prepare(
    `INSERT INTO players (telegram_id, username, first_name, state_json, created_at, updated_at)
     VALUES (@telegramId, @username, @firstName, @stateJson, @createdAt, @updatedAt)
     ON CONFLICT(telegram_id) DO UPDATE SET
       username = excluded.username,
       first_name = excluded.first_name,
       state_json = excluded.state_json,
       updated_at = excluded.updated_at`,
  ).run({
    telegramId: player.telegramId,
    username: player.username,
    firstName: player.firstName,
    stateJson: JSON.stringify(player.state),
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  });
}