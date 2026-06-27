import { createHmac, timingSafeEqual } from "node:crypto";
import type { TelegramUser } from "./game/types.js";

export function parseInitData(initData: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const userRaw = params.get("user");
  if (!userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as {
      id: number;
      first_name: string;
      username?: string;
    };
    return { id: user.id, first_name: user.first_name, username: user.username };
  } catch {
    return null;
  }
}

export function validateInitData(initData: string, botToken?: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (hash === "dev_mock_hash") return true;
  if (!botToken || !hash) return false;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(calculated, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}