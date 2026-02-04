import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import { generateSitemap } from "../sitemap";
import multer from "multer";

/* ================== Multer ================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/* ================== Server ================== */
async function startServer() {
  const app = express();
  const server = createServer(app);

  /* -------- CORS (مهم للفرونت) -------- */
  app.use(
    cors({
      origin: [
        "http://localhost:5173", // Vite
        "http://localhost:3000",
      ],
      credentials: true,
    })
  );

  /* -------- Body parsers -------- */
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  /* -------- No cache for APIs -------- */
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/trpc")) {
      res.setHeader("Cache-Control", "no-store");
    }
    next();
  });

  /* ================== Health check ================== */
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, message: "Backend is running 🚀" });
  });

  /* ================== OAuth ================== */
  registerOAuthRoutes(app);

  /* ================== Upload ================== */
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const key = `uploads/${Date.now()}-${req.file.originalname}`;
      const { url } = await storagePut(
        key,
        req.file.buffer,
        req.file.mimetype
      );

      res.json({ success: true, url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ================== Sitemap ================== */
  app.get("/sitemap.xml", async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const sitemap = await generateSitemap(baseUrl);
    res.type("application/xml").send(sitemap);
  });

  /* ================== tRPC ================== */
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  /* ================== Vite / Prod ================== */
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  /* ================== Listen ================== */
  const port = Number(process.env.PORT) || 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);
