import { Hono } from "hono";
// import { handle } from "hono/vercel";
import { Redis } from "@upstash/redis/cloudflare";
import { cors } from "hono/cors";

export const runtime = "edge";

const app = new Hono().basePath("/api");

let redis: Redis;

app.use("/search", cors());
app.get("/search", async (c) => {
  const start = performance.now();
  const query = c.req.query("q")?.toLowerCase();

  if (!query) return c.json({ results: [], duration: 0 });

  try {
    if (!redis) {
      redis = new Redis({
        url: process.env.REDIS_URL!,
        token: process.env.REDIS_TOKEN!,
      });
    }

    const rank = await redis.zrank("countries", query);

    if (rank === null) {
      return c.json({ results: [], duration: performance.now() - start });
    }

    const temp = await redis.zrange<string[]>("countries", rank, rank + 100);

    const res = [];
    for (const el of temp) {
      if (!el.startsWith(query)) break;
      if (el.endsWith("*")) res.push(el.slice(0, -1));
      if (res.length >= 10) break;
    }

    return c.json({
      results: res,
      duration: performance.now() - start,
    });
  } catch (err) {
    return c.json({ results: [], duration: 0 }, 500);
  }
});

// export const GET = handle(app);

export default {
  fetch: app.fetch,
};
