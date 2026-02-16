# Terminal Interface

A fully-featured terminal interface built with **SvelteKit 5**, featuring progressive enhancement, Cloudflare KV storage, markdown rendering, and comprehensive test coverage.

## ✨ Features

- 🎨 **ANSI Color Support** - Full 16-color ANSI code parsing
- 🌓 **Dark/Light Mode** - System preference detection with manual toggle
- 📝 **Markdown Rendering** - Read and display markdown files with syntax highlighting
- 📁 **File System** - Browse and read files with `cat` and `ls` commands
- 🔗 **Clickable Links** - Execute commands or open URLs from terminal output
- 🚀 **Progressive Enhancement** - Full functionality without JavaScript
- ☁️ **Cloudflare KV Storage** - Unlimited command history with session management
- ⚡ **Real-time Persistence** - History saved after every command (JS mode)
- 🧪 **68 Tests** - Comprehensive test coverage with Vitest
- 🎯 **TypeScript** - Full type safety throughout
- ♿ **Accessible** - WCAG compliant with keyboard navigation

## 🚀 Quick Start

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:unit

# Build for production
npm run build
```

## 📖 Documentation

- [Terminal Usage Guide](TERMINAL_README.md) - Commands, customization, and features
- [Cloudflare Deployment](CLOUDFLARE_DEPLOYMENT.md) - Production deployment guide
- [Color Codes Reference](COLOR_CODES.md) - ANSI color code documentation
- [Test Coverage](TEST_COVERAGE.md) - Testing strategy and coverage details

## 🏗️ Architecture

### Progressive Enhancement

**Without JavaScript:**

- Server-side rendering with full terminal history
- HTML form-based command execution
- Cookie persistence for theme and limited history
- Submit button for command execution

**With JavaScript:**

- Client-side terminal component with smooth interactions
- AJAX form submissions (no page reloads)
- Real-time history persistence to Cloudflare KV
- Auto-focus input with custom cursor
- Enhanced link interactions

### Storage Strategy

- **Session Management**: UUID-based sessions with secure cookies
- **Command History**: Cloudflare KV (production) or cookies (dev)
- **Theme Preference**: Cookie storage for instant loading
- **Automatic Fallback**: Cookie-based storage in local development

## 🧪 Testing

```sh
# Run unit tests
npm run test:unit

# Run e2e tests
npm run test:e2e

# Run all tests
npm test
```

**Test Coverage**: 68 tests covering commands, ANSI parsing, session management, file operations, and API endpoints.

## 📦 Deployment

### Cloudflare Pages

See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) for complete deployment instructions.

```sh
# Build for Cloudflare
npm run build

# Deploy
wrangler pages deploy .svelte-kit/cloudflare
```

### Local Development with KV

```sh
# Run with local KV storage
npm run dev:cf
```

## 🛠️ Tech Stack

- **Framework**: SvelteKit 5 with Runes
- **Styling**: Tailwind CSS v4
- **Storage**: Cloudflare KV
- **Markdown**: marked + DOMPurify
- **Testing**: Vitest + Playwright
- **Deployment**: Cloudflare Pages
- **Language**: TypeScript (strict mode)
