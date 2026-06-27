import cors from "cors";
import express from "express";
import gameRoutes from "./routes/game.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ ok: true, game: "kekius-ludus" }));
app.use("/api/game", gameRoutes);

app.listen(port, () => {
  console.info(`[kekius-server] Ludus API on http://localhost:${port}`);
});