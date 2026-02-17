# Cloudflare Deployment Guide

## Prerequisites

1. Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler`

## Setup Steps

### 1. Login to Cloudflare

```bash
wrangler login
```

### 2. Create KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create TERMINAL_KV

# Create preview KV namespace for development
wrangler kv:namespace create TERMINAL_KV --preview
```

This will output something like:

```
{ binding = "TERMINAL_KV", id = "abc123..." }
{ binding = "TERMINAL_KV", preview_id = "xyz789..." }
```

### 3. Update wrangler.toml

Replace the KV namespace configuration in `wrangler.toml` with your actual IDs:

```toml
name = "dariushdev-terminal"
compatibility_date = "2024-01-01"

# Pages configuration
pages_build_output_dir = ".svelte-kit/cloudflare"

[[kv_namespaces]]
binding = "TERMINAL_KV"
id = "abc123..."           # Your production KV namespace ID
preview_id = "xyz789..."   # Your preview KV namespace ID
```

### 4. Build the Project

```bash
npm run build
```

### 5. Deploy to Cloudflare Pages

#### Option A: Manual Deployment (via CLI)

```bash
npm run deploy
```

This builds the project and deploys using `wrangler pages deploy`.

#### Option B: Automatic Git Deployment (Recommended)

Connect your GitHub repository to Cloudflare Pages for automatic deployments:

1. Go to Cloudflare Dashboard → Pages
2. Create a new project (or go to existing project Settings)
3. Connect your GitHub repository
4. **Build settings**:
   - **Framework preset**: SvelteKit
   - **Build command**: `npm run build`
   - **Build output directory**: `.svelte-kit/cloudflare`
   - **Deploy command**: Leave empty or remove any custom deploy command

   ⚠️ **IMPORTANT**: Do NOT set `npx wrangler deploy` as the deploy command. That's for Workers, not Pages.

5. **Environment Variables**: None needed for basic deployment
6. **Add KV binding** in Settings → Functions → KV Namespace Bindings:
   - Variable name: `TERMINAL_KV`
   - KV namespace: Select your created namespace

## Local Development

### Testing with Local KV

Wrangler provides local KV storage for development:

```bash
# Option 1: Run dev server with local KV (recommended)
npm run dev:cf
```

This will:

- Start the Vite dev server
- Provide a local KV namespace (stored in `.wrangler/state`)
- Hot reload on file changes
- Test the full KV functionality locally

### Testing with Cookie Fallback

For quick development without KV:

```bash
npm run dev
```

The app automatically falls back to cookie-based storage with reduced history (20 entries) to avoid size limits.

### Testing Production Build Locally

To test the full production build with KV:

```bash
npm run preview:cf
```

This builds the app and runs it with Wrangler's local KV.

## Architecture

- **Session-based storage**: Uses session cookies to track users
- **KV for history**: Terminal history stored in Cloudflare KV (unlimited size)
- **Cookie for theme**: Dark mode preference stored in cookie (small size)
- **Automatic fallback**: Uses cookies in local dev, KV in production
- **Error handling**: If cookies exceed 4KB limit, automatically reduces history

## Environment Variables

None required! The app automatically detects Cloudflare platform and uses KV when available.
