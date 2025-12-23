# SwiftSearch ⚡

A high-performance, edge-first autocomplete search system demonstrating ultra-low-latency search using prefix indexing, edge execution, and intelligent client-side caching.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

## 🎯 Features

- **⚡ Ultra-Fast Search** - Sub-10ms query latency at the edge
- **🌍 Edge-First Architecture** - Cloudflare Workers for global distribution
- **💾 Intelligent Caching** - Client-side memory cache eliminates redundant requests
- **📊 Real-time Metrics** - Query timing and cache hit/miss indicators
- **🎨 Modern UI** - Built with Tailwind CSS and shadcn/ui components
- **🔒 Type-Safe** - End-to-end TypeScript for reliability

## 🏗️ Architecture

SwiftSearch uses a three-tier architecture optimized for speed:

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Next.js   │────▶│ Cloudflare Edge  │────▶│   Upstash   │
│   Client    │◀────│    Workers       │◀────│    Redis    │
└─────────────┘     └──────────────────┘     └─────────────┘
     Cache              Hono API              Prefix Index
```

### How It Works

1. **Pre-indexing Phase**
   - Country names are tokenized into all possible prefixes
   - Prefixes stored in Redis sorted set with lexicographic ordering
   - Terminal markers (`*`) enable exact match detection

2. **Edge Search API**
   - Queries execute on Cloudflare's global edge network
   - Redis `ZRANK` finds prefix position in O(log N)
   - `ZRANGE` retrieves matching entries efficiently
   - Results capped at configurable limit (default: 10)

3. **Client-side Intelligence**
   - Results cached in memory on first query
   - Subsequent identical queries resolve instantly
   - UI displays cache status for transparency

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19 |
| **Styling** | Tailwind CSS, shadcn/ui, Lucide Icons |
| **Edge Runtime** | Cloudflare Workers |
| **API Framework** | Hono (lightweight, edge-optimized) |
| **Database** | Upstash Redis (serverless) |
| **Language** | TypeScript |

## 📦 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun
- Upstash Redis account ([free tier available](https://upstash.com))
- Cloudflare Workers account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thev1ndu/swiftsearch.git
   cd swiftsearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:
   ```env
   REDIS_URL=your_upstash_redis_rest_url
   REDIS_TOKEN=your_upstash_redis_rest_token
   ```

   Get these credentials from your [Upstash Console](https://console.upstash.com) → Redis → REST API section.

4. **Populate the Redis index**

   Run the indexing script to insert prefix data:
   ```bash
   node src/lib/seed.ts
   # or
   tsx src/lib/seed.ts
   ```

   This only needs to run once unless your dataset changes.

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) and start searching!

## 📁 Project Structure

```
swiftsearch/
├── src/
│   ├── app/
│   │   ├── api/[[...route]]/
│   │   │   └── route.ts       # API route handler
│   │   ├── favicon.ico
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Search UI page
│   ├── components/            # React components
│   └── lib/
│       ├── seed.ts            # Redis indexer script
│       └── utils.ts           # Utility functions
```

## 🎯 Usage Example

```typescript
// Search API endpoint
const response = await fetch('https://your-worker.workers.dev/api/search?q=united');

// Response format
{
  "results": ["United States", "United Kingdom", "United Arab Emirates"],
  "duration": 8.42,
  "cached": false
}
```

## 🚢 Deployment

### Deploy Frontend (Vercel)

The easiest way to deploy the Next.js frontend:

```bash
vercel
```

Or connect your GitHub repository on [Vercel](https://vercel.com) for automatic deployments.

### Deploy API (Cloudflare Workers)

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Configure secrets**
   ```bash
   wrangler secret put REDIS_URL
   wrangler secret put REDIS_TOKEN
   ```

4. **Deploy**
   ```bash
   wrangler deploy
   # or
   yarn deploy
   ```

5. **Update API URL in frontend**

   Update the API endpoint in your Next.js app to point to your deployed Worker URL.

## ⚡ Performance Characteristics

| Metric | Value |
|--------|-------|
| **Cold Start** | < 5ms (edge workers) |
| **Query Latency** | 5-15ms (edge to Redis) |
| **Cached Query** | < 1ms (client memory) |
| **Index Lookup** | O(log N) complexity |
| **Throughput** | 1000+ req/s per edge location |

## 🔧 Configuration

### Adjusting Result Limits

In `src/app/api/[[...route]]/route.ts`:
```typescript
const MAX_RESULTS = 10; // Change this value
```

### Modifying Cache Strategy

In `src/components/search-card.tsx`:
```typescript
// Disable caching
const useCache = false;

// Clear cache programmatically
cache.clear();
```

### Custom Dataset

Replace the countries array in `src/lib/seed.ts` with your own data:
```typescript
const myData = [
  "Product A",
  "Product B",
  // ...
];
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Test the API locally
curl "http://localhost:3000/api/search?q=united"
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - Edge computing platform
- [Upstash Redis](https://upstash.com/docs/redis) - Serverless Redis documentation
- [Hono Framework](https://hono.dev) - Ultrafast web framework for the edge
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable component library


**SwiftSearch** — Fast, simple, and built for the edge 🚀
