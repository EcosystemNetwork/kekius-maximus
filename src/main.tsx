import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installTelegramMock } from "./mocks/telegram-mock";
import App from "./App.tsx";

if (import.meta.env.DEV) {
  installTelegramMock();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);