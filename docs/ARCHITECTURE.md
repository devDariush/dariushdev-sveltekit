# Architecture Documentation

Deep dive into the technical architecture and implementation details of the Terminal Interface.

## Table of Contents

- [Virtual Static Files Plugin](#virtual-static-files-plugin)
- [Storage Architecture](#storage-architecture)
- [Persist Action (Async History Saving)](#persist-action-async-history-saving)
- [API Endpoints](#api-endpoints)
- [Progressive Enhancement Implementation](#progressive-enhancement-implementation)

---

## Virtual Static Files Plugin

### Problem

Cloudflare Workers (and other edge runtimes) **do not have filesystem access** at runtime. This means commands like `ls` that need to list files in the `/static` directory cannot read the filesystem when deployed.

### Solution

A custom Vite plugin reads the static directory **at build time** and creates a virtual module that imports can reference.

**Location**: `vite.config.ts`

```typescript
function staticFilesPlugin(): Plugin {
  const virtualModuleId = 'virtual:static-files';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'static-files',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const staticDir = join(process.cwd(), 'static');
        const entries = readdirSync(staticDir, { withFileTypes: true });
        const files = entries
          .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
          .map((entry) => entry.name)
          .sort();
        return `export const staticFiles = ${JSON.stringify(files)};`;
      }
    }
  };
}
```

### How It Works

1. **Build Time**: Plugin reads `/static` directory and generates a list of files
2. **Module Creation**: Creates a virtual module `virtual:static-files` that exports the file list
3. **Type Declaration**: `src/virtual-static-files.d.ts` provides TypeScript types
4. **Import**: Code imports from `'virtual:static-files'` to get the file list

### Usage

**In commands-utils.ts**:

```typescript
import { staticFiles } from 'virtual:static-files';

case 'ls': {
  if (staticFiles.length === 0) {
    return { output: 'No files available' };
  }
  return { output: staticFiles.join('\n') };
}
```

**In API endpoint** (`src/routes/api/files/+server.ts`):

```typescript
import { staticFiles } from 'virtual:static-files';

export const GET: RequestHandler = async () => {
  return json(staticFiles);
};
```

### Benefits

- ✅ Works on Cloudflare Workers (no filesystem access needed)
- ✅ No runtime overhead (file list is static, bundled at build time)
- ✅ Consistent behavior across environments
- ✅ Automatically excludes hidden files (those starting with `.`)
- ✅ Alphabetically sorted file list

---

## Storage Architecture

### Overview

The terminal uses a **dual storage strategy** that automatically selects the best storage method based on the environment.

| Environment    | Storage Method | History Limit | Notes                       |
| -------------- | -------------- | ------------- | --------------------------- |
| **Production** | Cloudflare KV  | 100 entries   | Unlimited size, 7-day TTL   |
| **Local Dev**  | Cookies        | 20 entries    | 4KB browser limit, fallback |

### Cloudflare KV (Production)

**When Available**: `platform?.env?.TERMINAL_KV` exists

```typescript
await platform.env.TERMINAL_KV.put(
  `history:${sessionId}`,
  JSON.stringify(history),
  { expirationTtl: 60 * 60 * 24 * 7 } // 7 days
);
```

**Benefits**:

- No size limitations (stores full 100-entry history)
- Server-side storage (secure, not visible in browser)
- Fast edge-network access
- Automatic expiration after 7 days

**Key Format**: `history:{sessionId}` where sessionId is a UUID

### Cookie Storage (Local Dev Fallback)

**When Used**: KV not available (local development)

```typescript
try {
  cookies.set('terminal-history', JSON.stringify(history), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
} catch {
  // If cookie is too large, store less history
  const reducedHistory = history.slice(-20);
  cookies.set('terminal-history', JSON.stringify(reducedHistory), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}
```

**Limitations**:

- Browser cookies have a **4KB size limit**
- Automatically reduces to **20 entries** if exceeds limit
- Visible in browser dev tools
- Sent with every request (bandwidth overhead)

### Cookie Fallback Logic

The cookie fallback has **three layers of protection** against size errors:

1. **Try-catch wrapper**: Attempts to save full history
2. **Automatic reduction**: On error, reduces to last 20 entries
3. **Silent failure**: If still fails, continues without error

**Locations in code**:

- `src/routes/+page.server.ts` lines 139-151 (link-click action)
- `src/routes/+page.server.ts` lines 203-215 (execute action)
- `src/routes/+page.server.ts` lines 245-257 (persist action)

### Session Management

**Session IDs**:

- Generated using `crypto.randomUUID()` (UUID v4 format)
- Stored in `session-id` cookie (httpOnly, secure in production)
- 1-year expiration
- Used as key prefix for KV storage

**Cookie Security**:

```typescript
cookies.set('session-id', sessionId, {
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
  httpOnly: true,              // Not accessible via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax'              // CSRF protection
});
```

### Storage Selection Flow

```
Request arrives
    ↓
Check if platform.env.TERMINAL_KV exists
    ↓
    ├─ YES → Use KV storage (100 entry limit)
    │         └─ Save with 7-day TTL
    │
    └─ NO → Use cookie storage (20 entry limit)
              └─ Try full history
                  └─ On error: reduce to 20 entries
```

---

## Persist Action (Async History Saving)

### Purpose

The `persist` action enables **real-time, asynchronous history saving** for the JavaScript-enhanced terminal without blocking user interaction.

### How It Works

**In Terminal.svelte** (client-side):

```typescript
async function saveHistory(historyToSave: HistoryEntry[]) {
  try {
    await fetch('?/persist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        history: JSON.stringify(historyToSave)
      })
    });
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}
```

**In +page.server.ts** (server-side):

```typescript
persist: async ({ request, cookies, platform }) => {
  const sessionId = getOrCreateSessionId(cookies);
  const data = await request.formData();
  const historyJson = data.get('history')?.toString();

  const history = JSON.parse(historyJson);

  // Save to KV or cookies (with fallback logic)
  if (platform?.env?.TERMINAL_KV) {
    await platform.env.TERMINAL_KV.put(
      `history:${sessionId}`,
      JSON.stringify(history),
      { expirationTtl: 60 * 60 * 24 * 7 }
    );
  } else {
    // Cookie fallback with size handling
    try {
      cookies.set('terminal-history', JSON.stringify(history), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
    } catch {
      const reducedHistory = history.slice(-20);
      cookies.set('terminal-history', JSON.stringify(reducedHistory), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
    }
  }

  return { success: true };
}
```

### When It's Called

The persist action is triggered from `Terminal.svelte` **after every command execution**:

```typescript
async function handleSubmit() {
  // ... execute command ...

  // Save history to server (excluding greeting)
  const historyToSave = history.filter((entry) => entry.type !== 'greeting');
  await saveHistory(historyToSave);
}
```

### Why It's Needed

Without the persist action:

- ❌ History only saved on full page reload
- ❌ Users lose history if they close tab
- ❌ No persistence in JS-enhanced mode

With the persist action:

- ✅ History saved after every command (real-time)
- ✅ Survives browser refresh and tab close
- ✅ Same behavior as NoJS mode (which saves on form submit)
- ✅ Non-blocking (async, doesn't wait for response)

### Progressive Enhancement

| Mode        | Save Trigger       | Action Used |
| ----------- | ------------------ | ----------- |
| **No JS**   | Form submission    | `execute`   |
| **With JS** | After command runs | `persist`   |

Both modes achieve the same result: persistent command history across sessions.

---

## API Endpoints

### GET /api/files

**Purpose**: Provide file listing for `ls` command in client-side terminal.

**Location**: `src/routes/api/files/+server.ts`

**Implementation**:

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { staticFiles } from 'virtual:static-files';

export const GET: RequestHandler = async () => {
  return json(staticFiles);
};
```

**Usage**: Called by client-side `ls` command implementation (though currently `ls` uses the imported `staticFiles` directly).

**Response Format**:

```json
["about.md", "contact.md", "docs.md", "profile.png", "social.md"]
```

**Characteristics**:

- Returns alphabetically sorted file list
- Excludes hidden files (starting with `.`)
- Excludes directories
- Excludes infrastructure files not intended for terminal users (`robots.txt`, `sitemap.xml`)
- Uses virtual static files plugin (works on Cloudflare)
- No authentication required (public files)

### Form Actions (POST)

**Location**: `src/routes/+page.server.ts`

#### 1. `execute` Action

**Purpose**: Execute commands and manage history (NoJS mode primary, also handles theme toggle and link clicks)

**Request Data**:

```typescript
{
  command?: string,      // Terminal command to execute
  action?: 'toggle-theme' | 'link-click',
  link-type?: 'command' | 'url',
  link-target?: string
}
```

**Response**:

```typescript
{
  success: boolean,
  darkMode?: boolean  // Only for theme toggle
}
```

**Flow**:

1. Load current history from storage
2. Handle special actions (theme, link-click)
3. Execute command and add to history
4. Limit history to MAX_HISTORY (100 entries)
5. Save to KV or cookies with fallback
6. Return success status

#### 2. `persist` Action

**Purpose**: Save history asynchronously from JS-enhanced terminal

**Request Data**:

```typescript
{
  history: string  // JSON-stringified HistoryEntry[]
}
```

**Response**:

```typescript
{
  success: boolean
}
```

**Flow**:

1. Parse history JSON
2. Save to KV or cookies with fallback
3. Return success status

**Note**: This action doesn't load existing history—it receives the complete history array from the client.

---

## Progressive Enhancement Implementation

### Detection Strategy

The app detects JavaScript availability using Svelte's `browser` constant:

```svelte
{#if browser}
	<!-- Client-side rich terminal -->
	<Terminal initialHistory={data.history} initialDarkMode={data.darkMode} />
{:else}
	<!-- SSR fallback -->
	<div class="terminal-fallback">
		<!-- Form-based terminal -->
	</div>
{/if}
```

### Two Complete Implementations

| Feature               | No JavaScript                            | With JavaScript                      |
| --------------------- | ---------------------------------------- | ------------------------------------ |
| **Component**         | `+page.svelte` (form-based)              | `Terminal.svelte` (rich client)      |
| **Command Execution** | Form POST to `?/execute`                 | Client-side with `executeCommand()`  |
| **History Save**      | Automatic on form submit                 | Async call to `?/persist`            |
| **Theme Toggle**      | Form POST to `?/execute` (action=toggle) | Client state + cookie via fetch      |
| **Link Interaction**  | Form submission                          | JS click handler with preventDefault |
| **Page Reload**       | Every command (full page)                | No reload (AJAX)                     |
| **Storage**           | Server decides (KV or cookie)            | Server decides (KV or cookie)        |
| **Submit Button**     | Visible                                  | Hidden (submit on Enter)             |

### Shared Logic

Both modes use the **same command execution logic** from `commands-utils.ts`:

```typescript
export async function executeCommand(
  cmd: string,
  args: string[],
  options?: { fetch?: (url: string) => Promise<Response> }
): Promise<{ output: string; links?: Link[]; ... }>
```

This ensures:

- ✅ Consistent behavior across JS/NoJS modes
- ✅ Single source of truth for command logic
- ✅ Easier testing and maintenance
- ✅ No duplication of business logic

### Enhancement Points

**Progressive Enhancement** means the site works without JS, but is enhanced when JS is available:

1. **Baseline (No JS)**:
   - Full terminal functionality via forms
   - Command history persists
   - Theme toggle works
   - Links are clickable
   - Markdown renders correctly

2. **Enhanced (With JS)**:
   - Smooth interactions (no page reload)
   - Auto-focus on input
   - Real-time history saving
   - Better UX (instant theme switch)
   - Animated scrolling

The site is **fully functional** in both modes—JavaScript just makes it nicer.

---

## Testing Edge Runtime

**Location**: `vite.config.ts`

The test configuration uses `edge-runtime` environment for server tests:

```typescript
{
  name: 'server',
  environment: 'edge-runtime',
  include: ['src/**/*.{test,spec}.{js,ts}'],
  exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
}
```

### Why Edge Runtime?

1. **Cloudflare Workers Compatibility**: Tests run in an environment that closely mimics Cloudflare Workers
2. **No Node.js APIs**: Catches issues where Node-specific APIs are used (which won't work on Workers)
3. **Real-world Conditions**: Tests reflect actual production environment
4. **Catches Platform Issues**: Finds bugs that only appear in edge runtime (like filesystem access)

### What Gets Tested

- Command execution logic
- ANSI color parsing
- Session management
- Type definitions
- API endpoint responses

All these run in an environment that simulates Cloudflare Workers, ensuring they'll work when deployed.

---

## Key Architectural Decisions

### Why Not Server-Side Filesystem?

**Problem**: Cloudflare Workers don't have filesystem access at runtime.

**Solution**: Virtual static files plugin reads files at build time and bundles the list.

### Why Two Storage Systems?

**Problem**: Need unlimited history in production, but KV isn't available locally.

**Solution**: Automatic fallback to cookies in local dev, with reduced history when needed.

### Why Persist Action?

**Problem**: JS-enhanced terminal executes commands client-side, doesn't automatically persist.

**Solution**: Dedicated async action saves history after every command without blocking UX.

### Why Shared Command Logic?

**Problem**: Need consistency between JS and NoJS modes.

**Solution**: Single `executeCommand()` function used by both client and server, ensuring identical behavior.

These decisions prioritize:

- ✅ **Cloudflare Workers compatibility**
- ✅ **Progressive enhancement** (works without JS)
- ✅ **Developer experience** (works in local dev)
- ✅ **User experience** (fast, reliable, persistent)
- ✅ **Maintainability** (DRY, single source of truth)
