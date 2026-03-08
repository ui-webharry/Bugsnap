import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import cors from "cors";

const db = new Database("bugsnap.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    screenshot TEXT,
    url TEXT,
    userAgent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'open'
  )
`);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors()); // Enable CORS for all routes
  app.use(express.json({ limit: '10mb' }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Serve widget.js in dev mode by redirecting to the vite entry point
  if (process.env.NODE_ENV !== "production") {
    app.get("/widget.js", (req, res) => {
      res.redirect("/src/widget-entry.tsx");
    });
  }

  app.post("/api/reports", (req, res) => {
    const { title, description, screenshot, url, userAgent } = req.body;
    const stmt = db.prepare(
      "INSERT INTO reports (title, description, screenshot, url, userAgent) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(title, description, screenshot, url, userAgent);
    res.json({ id: info.lastInsertRowid, success: true });
  });

  app.get("/api/reports", (req, res) => {
    const reports = db.prepare("SELECT * FROM reports ORDER BY timestamp DESC").all();
    res.json(reports);
  });

  app.patch("/api/reports/:id", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.delete("/api/reports/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM reports WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
