type ThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
};

type MockUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

function createMockUser(): MockUser {
  const stored = localStorage.getItem("kekius_mock_user");
  if (stored) return JSON.parse(stored) as MockUser;

  const user: MockUser = {
    id: 900_001,
    first_name: "DevFrog",
    username: "dev_frog",
    language_code: "en",
    is_premium: false,
  };
  localStorage.setItem("kekius_mock_user", JSON.stringify(user));
  return user;
}

export function installTelegramMock(): void {
  if (window.Telegram?.WebApp?.initData) return;

  const user = createMockUser();
  const theme: ThemeParams = {
    bg_color: "#0b1f14",
    text_color: "#f4ffe8",
    hint_color: "#8fbf7a",
    link_color: "#7dff4f",
    button_color: "#2f6b1f",
    button_text_color: "#f4ffe8",
    secondary_bg_color: "#142a1c",
  };

  const webApp = {
    initData: `user=${encodeURIComponent(JSON.stringify(user))}&auth_date=${Math.floor(Date.now() / 1000)}&hash=dev_mock_hash`,
    initDataUnsafe: { user, auth_date: Math.floor(Date.now() / 1000), hash: "dev_mock_hash" },
    version: "8.0",
    platform: "web",
    colorScheme: "dark" as const,
    themeParams: theme,
    isExpanded: true,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    headerColor: theme.bg_color,
    backgroundColor: theme.bg_color,
    isClosingConfirmationEnabled: false,
    ready: () => console.info("[kekius-mock] WebApp.ready()"),
    expand: () => console.info("[kekius-mock] WebApp.expand()"),
    close: () => console.info("[kekius-mock] WebApp.close()"),
    setHeaderColor: (color: string) => console.info("[kekius-mock] header", color),
    setBackgroundColor: (color: string) => console.info("[kekius-mock] background", color),
    enableClosingConfirmation: () => undefined,
    disableClosingConfirmation: () => undefined,
    onEvent: () => undefined,
    offEvent: () => undefined,
    sendData: (data: string) => console.info("[kekius-mock] sendData", data),
    openLink: (url: string) => window.open(url, "_blank", "noopener,noreferrer"),
    openTelegramLink: (url: string) => window.open(url, "_blank", "noopener,noreferrer"),
    showPopup: (params: { message: string; title?: string }) => alert(params.message),
    showAlert: (message: string) => alert(message),
    showConfirm: (message: string, cb?: (ok: boolean) => void) => cb?.(confirm(message)),
    HapticFeedback: {
      impactOccurred: (style: string) => console.debug("[kekius-mock] haptic", style),
      notificationOccurred: (type: string) => console.debug("[kekius-mock] haptic", type),
      selectionChanged: () => console.debug("[kekius-mock] haptic selection"),
    },
    MainButton: {
      text: "",
      color: theme.button_color,
      textColor: theme.button_text_color,
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      setText: () => undefined,
      onClick: () => undefined,
      offClick: () => undefined,
      show: () => undefined,
      hide: () => undefined,
      enable: () => undefined,
      disable: () => undefined,
      showProgress: () => undefined,
      hideProgress: () => undefined,
    },
  };

  window.Telegram = { WebApp: webApp };
  console.info("[kekius-mock] Telegram WebApp emulator active — open http://localhost:5173");
}