import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

export const runtime = "edge";

app.get("/search", (c) => {
  return c.json({ message: "Hello from /api/search" });
});

export const GET = handle(app);
export default app as never;
