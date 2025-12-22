import { Hono } from "hono";
import { handle } from "hono/vercel";
import { env } from "hono/adapter";
import { Redis } from "@upstash/redis";

export const runtime = "edge";

const app = new Hono().basePath("/api");

type EnvConfig = {
  REDIS_URL: string;
  REDIS_TOKEN: string;
};

app.get("/search", async (c) => {
  try {
    const { REDIS_URL, REDIS_TOKEN } = env<EnvConfig>(c);

    const start = performance.now();

    const redis = new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    });

    const query = c.req.query("q")?.toLowerCase();

    if (!query) {
      return c.json({ results: [] }, { status: 400 });
    }

    const res = [];
    const rank = await redis.zrank("countries", query);

    if (rank !== null && rank !== undefined) {
      // @ts-ignore
      const temp = await redis.zrange<string[]>("countries", rank, rank + 100);

      for (const el of temp) {
        if (!el.startsWith(query)) {
          break;
        }

        if (el.endsWith("*")) {
          res.push(el.substring(0, el.length - 1));
        }
      }
    }

    const end = performance.now();

    return c.json({
      results: res,
      duration: end - start,
    });
  } catch (err) {
    console.error(err);

    return c.json(
      { results: [], message: "Something went wrong." },
      {
        status: 500,
      }
    );
  }
});

export const GET = handle(app);
export default app as never;
