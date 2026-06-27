import WebApp from "@twa-dev/sdk";

export type GameUser = {
  id: number;
  firstName: string;
  username: string | null;
  isPremium: boolean;
};

export function isTelegramEnvironment(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData);
}

export function isDevMock(): boolean {
  return WebApp.initDataUnsafe.hash === "dev_mock_hash";
}

export function initTelegramApp(): GameUser | null {
  WebApp.ready();
  WebApp.expand();
  WebApp.setHeaderColor("#0b1f14");
  WebApp.setBackgroundColor("#0b1f14");

  const user = WebApp.initDataUnsafe.user;
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.first_name,
    username: user.username ?? null,
    isPremium: Boolean(user.is_premium),
  };
}

export function hapticTap(): void {
  WebApp.HapticFeedback.impactOccurred("light");
}

export function hapticUpgrade(): void {
  WebApp.HapticFeedback.notificationOccurred("success");
}