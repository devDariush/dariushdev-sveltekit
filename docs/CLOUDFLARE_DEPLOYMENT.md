# Cloudflare Workers deployment

## Runtime and configuration

Use Node.js 24 LTS and install dependencies with `npm ci`. The project uses SvelteKit 3, Svelte 5 and Vite 8. The Cloudflare adapter is configured in `vite.config.ts`.

`wrangler.jsonc` defines:

- Worker: `dariushdev-sveltekit`
- Static assets: `.svelte-kit/cloudflare`, exposed as `ASSETS`
- History namespace: `TERMINAL_KV`
- Public upstream: `https://dariushdev-sveltekit.dkomeili.workers.dev`
- `workers_dev: true` and no Cloudflare custom-domain routes

Server routes import `env` from `cloudflare:workers`. Binding types are declared in `src/app.d.ts` using `@cloudflare/workers-types`.

## Local development

```sh
npm ci
npm run dev
```

The adapter emulates Cloudflare bindings locally. Cookie storage remains available when the KV binding is absent.

To test the production Worker with local KV storage:

```sh
npm run preview
```

Local Worker data is stored under `.wrangler/state`; it does not use production KV.

## Validation

```sh
npm run check
npm run lint
npm run test:unit -- --run
npx playwright install chromium
npm run test:e2e
npm audit
```

CI runs on Ubuntu 24.04 with Node.js 24 and installs Chromium's system dependencies before E2E tests. The tests exercise terminal commands, Markdown, theme changes, history persistence and form submission without JavaScript.

## Deployment

The existing Cloudflare Workers Builds connection deploys pushes to `main`:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

For manual deployment, authenticate with `npx wrangler login`, then run:

```sh
npm run deploy
```

Keep the existing production KV namespace ID when updating configuration, so saved terminal sessions remain available.

## Domain routing

DNS stays at deSEC:

| Name              | Type  | Value           |
| ----------------- | ----- | --------------- |
| `dariush.dev`     | A     | `89.168.84.234` |
| `www.dariush.dev` | CNAME | `dariush.dev.`  |

Caddy on `oracle-vps` terminates HTTPS and proxies to the Worker. Its configuration is `/mnt/data/infra/caddy/Caddyfile` and runs in the rootless Podman container `caddy`.

```caddyfile
dariush.dev {
    reverse_proxy https://dariushdev-sveltekit.dkomeili.workers.dev {
        header_up Host dariushdev-sveltekit.dkomeili.workers.dev
        header_up Origin "^https://dariush[.]dev$" "https://dariushdev-sveltekit.dkomeili.workers.dev"
    }
}

www.dariush.dev {
    redir https://dariush.dev{uri} permanent
}
```

Only the exact public same-origin header is mapped to the upstream origin for SvelteKit form actions. Other origins remain unchanged and are rejected by SvelteKit's CSRF check. Do not replace this with a blanket Origin rewrite or disable CSRF checks.

Caddy obtains and renews the public certificates automatically. After changing its configuration, validate and reload it:

```sh
podman exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
podman exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```
