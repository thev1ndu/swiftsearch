"use client";

import { useState, useEffect, useRef } from "react";
import { SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchCard } from "@/components/search-card";

// In-memory cache keyed by normalized query string
const CACHE = new Map<string, { list: string[]; server?: number }>();

export default function SearchPage() {
  // Current query input
  const [q, setQ] = useState("");

  // Search result state with source and timing metadata
  const [res, setRes] = useState<{ list: string[]; src: string; time: number }>(
    { list: [], src: "", time: 0 }
  );

  // Network loading indicator
  const [loading, setLoading] = useState(false);

  // Tracks the active request to allow cancellation on rapid input changes
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const query = q.trim().toLowerCase();

    // Reset state when query is empty
    if (!query) {
      setRes({ list: [], src: "", time: 0 });
      setLoading(false);
      return;
    }

    const start = performance.now();

    // Serve results from in-memory cache when available
    if (CACHE.has(query)) {
      const cached = CACHE.get(query)!;
      setRes({
        list: cached.list,
        src: "memory",
        time: performance.now() - start,
      });
      setLoading(false);
      return;
    }

    // Abort any in-flight request before issuing a new one
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);

    // Fetch results from edge API
    fetch(
      `https://swiftsearch.itsthw9.workers.dev/api/search?q=${encodeURIComponent(
        query
      )}`,
      {
        signal: abortRef.current.signal,
      }
    )
      .then((r) => r.json())
      .then((data) => {
        const payload = {
          list: (data.results || []) as string[],
          server: data.duration,
        };

        // Cache successful responses for instant reuse
        CACHE.set(query, payload);

        setRes({
          list: payload.list,
          src: "network",
          time: performance.now() - start,
        });
        setLoading(false);
      })
      .catch((e) => {
        // Ignore abort errors; fail silently for others
        if (e?.name !== "AbortError") setLoading(false);
      });
  }, [q]);

  return (
    <main className="relative flex size-full min-h-screen w-full items-center justify-center p-4">
      <div className="mx-auto w-full max-w-5xl">
        <SearchCard
          title="SwiftSearch"
          description="Access high-performance data index. Queries are optimized for edge delivery and local memory caching."
        >
          <div className="w-full space-y-4">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type to search countries or records..."
                className="h-12 bg-background pl-10 shadow-sm"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="relative mt-8 min-h-[300px] w-full overflow-hidden border bg-slate-50/30 dark:bg-transparent">
              {res.list.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="p-2">
                    {res.list.map((item) => (
                      <div
                        key={item}
                        className="cursor-default border-b border-muted/20 px-4 py-3 text-sm capitalize shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800 last:border-0"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 border border-dashed bg-background p-4 shadow-sm">
                    <SearchIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {q && !loading ? `No results for "${q}"` : "Awaiting Input"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/50">
                    Search is performed instantly across edge network.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div
            className={`pt-8 flex items-center justify-center gap-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 transition-opacity ${
              res.src ? "opacity-100" : "opacity-0"
            }`}
            style={{ height: 18 }}
            aria-hidden={!res.src}
          >
            <span className="flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  res.src === "memory" ? "bg-green-500" : "bg-blue-500"
                }`}
              />
              {res.src}
            </span>
            <span>{res.src ? `• ${res.time.toFixed(2)}ms latency` : ""}</span>
          </div>
        </SearchCard>
      </div>
    </main>
  );
}
