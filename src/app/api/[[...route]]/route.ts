import { Hono } from "hono";
import { Redis } from "@upstash/redis/cloudflare";
import { cors } from "hono/cors";

export const runtime = "edge";

// Initialize Hono app with a common API base path
const app = new Hono().basePath("/api");

// Lazily initialized Redis client (reused across requests)
let redis: Redis;

// Enable CORS for the search endpoint
app.use("/search", cors());

// Autocomplete-style search endpoint
app.get("/search", async (c) => {
  const start = performance.now();
  const query = c.req.query("q")?.toLowerCase();

  // Fast exit for empty queries
  if (!query) return c.json({ results: [], duration: 0 });

  try {
    // Initialize Redis client on first request
    if (!redis) {
      redis = new Redis({
        url: process.env.REDIS_URL!,
        token: process.env.REDIS_TOKEN!,
      });
    }

    // Locate the starting rank of the query in the sorted set
    const rank = await redis.zrank("countries", query);

    // Query not found
    if (rank === null) {
      return c.json({ results: [], duration: performance.now() - start });
    }

    // Fetch a window of candidates for prefix matching
    const temp = await redis.zrange<string[]>("countries", rank, rank + 100);

    const res: string[] = [];

    // Collect up to 10 prefix matches
    for (const el of temp) {
      if (!el.startsWith(query)) break;
      if (el.endsWith("*")) res.push(el.slice(0, -1));
      if (res.length >= 10) break;
    }

    return c.json({
      results: res,
      duration: performance.now() - start,
    });
  } catch {
    // Fail safely on Redis or runtime errors
    return c.json({ results: [], duration: 0 }, 500);
  }
});

// Cloudflare Workers entry point
export default {
  fetch: app.fetch,
};
