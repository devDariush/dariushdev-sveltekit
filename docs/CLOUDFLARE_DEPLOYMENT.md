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

### 3. Update wrangler.jsonc

Replace the KV namespace configuration in `wrangler.jsonc` with your actual IDs:

```jsonc
{
	"name": "dariushdev-sveltekit",
	"compatibility_date": "2026-02-12",
	"kv_namespaces": [
		{
			"binding": "TERMINAL_KV",
			"id": "abc123...", // Your production KV namespace ID
			"preview_id": "xyz789..." // Your preview KV namespace ID
		}
	]
}
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

This builds the project and deploys using `wrangler deploy`.

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

### Quick Development (Cookie Fallback)

```bash
npm run dev
```

The app automatically falls back to cookie-based storage with reduced history (20 entries) to avoid size limits. This is the fastest way to develop and test changes.

### Testing Production Build with Local KV

To test the full production build with Wrangler's local KV:

```bash
npm run preview
```

This will:

- Build the app for production
- Start Wrangler dev server
- Provide a local KV namespace (stored in `.wrangler/state`)
- Test the full KV functionality locally

## Architecture

- **Session-based storage**: Uses session cookies to track users
- **KV for history**: Terminal history stored in Cloudflare KV (unlimited size)
- **Cookie for theme**: Dark mode preference stored in cookie (small size)
- **Automatic fallback**: Uses cookies in local dev (20 entries max), KV in production (100 entries max)
- **Error handling**: Cookie storage includes automatic size fallback when exceeding 4KB limit

> **Deep Dive**: See [ARCHITECTURE.md](ARCHITECTURE.md#storage-architecture) for complete technical details on storage mechanisms, KV configuration, and cookie fallback logic.

## Environment Variables

None required! The app automatically detects Cloudflare platform and uses KV when available.

## Custom Domain Setup

To use your custom domain `dariush.dev` (or any domain on Cloudflare):

### Configuration in `wrangler.jsonc`

You can configure your custom domain directly in the `wrangler.jsonc` file using the `routes` property. For example:

```jsonc
"routes": [
	{
		"pattern": "dariush.dev",
		"custom_domain": true
	},
	{
		"pattern": "www.dariush.dev",
		"custom_domain": true
	}
]
```

This configuration ensures that your Worker is accessible via both `dariush.dev` and `www.dariush.dev`. You can also add additional routes as needed.

### Redirects (Optional)

To redirect `www.dariush.dev` → `dariush.dev` (or vice versa):

#### Using `_redirects` File

The project already includes a `_redirects` file at the root. You can add:

```
# Redirect www to apex domain
https://www.dariush.dev/* https://dariush.dev/:splat 301!

# Or redirect apex to www
# https://dariush.dev/* https://www.dariush.dev/:splat 301!
```

#### Using Cloudflare Page Rules

Alternatively, use Cloudflare Page Rules or Bulk Redirects:

1. Go to your domain in Cloudflare Dashboard
2. Navigate to **Rules** → **Page Rules** (or **Bulk Redirects**)
3. Create a forwarding rule:
   - URL Match: `www.dariush.dev/*`
   - Forwarding URL: `https://dariush.dev/$1`
   - Status: `301 - Permanent Redirect`

### Verification

Once configured, test your domain:

```bash
# Check DNS propagation
dig dariush.dev

# Test HTTPS
curl -I https://dariush.dev

# Open in browser
open https://dariush.dev
```

### Troubleshooting

**Domain not working?**

- Ensure the `routes` property is correctly configured in `wrangler.jsonc`
- Wait 5-10 minutes for DNS propagation
- Check SSL certificate status in Cloudflare Dashboard
- Clear browser cache or test in incognito mode

**SSL Certificate Error?**

- SSL provisioning can take up to 24 hours (usually < 5 minutes)
- Ensure domain is added in Pages Custom domains section
- Check Universal SSL is enabled: SSL/TLS → Overview → Edge Certificates

**Redirect Loop?**

- Check for conflicting redirect rules in multiple places (\_redirects file, Page Rules, etc.)
- Ensure only one redirect configuration is active
