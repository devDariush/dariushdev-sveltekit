# Terminal Interface

A fully-featured terminal interface built with **SvelteKit 3 and Svelte 5**, featuring progressive enhancement, Cloudflare KV storage, markdown rendering, and comprehensive test coverage.

🌐 **Live Demo**: [https://dariush.dev](https://dariush.dev)

## ✨ Features

- 🎨 **ANSI Color Support** - Full 16-color ANSI code parsing
- 🌓 **Dark/Light Mode** - System preference detection with manual toggle
- 📝 **Markdown Rendering** - Read and display markdown files with syntax highlighting
- 📁 **File System** - Browse and read files with `cat` and `ls` commands
- 🔗 **Clickable Links** - Execute commands or open URLs from terminal output
- 🚀 **Progressive Enhancement** - Full functionality without JavaScript
- ☁️ **Cloudflare KV Storage** - Unlimited command history with session management
- ⚡ **Real-time Persistence** - History saved after every command (JS mode)
- 🧪 **Comprehensive Tests** - Full test coverage with Vitest
- 🎯 **TypeScript** - Full type safety throughout
- ♿ **Accessible** - WCAG compliant with keyboard navigation

## 🚀 Quick Start

Use Node.js 24 LTS (see `.node-version`). Project configuration lives in `vite.config.ts`; shared imports use the `#lib` alias declared in `package.json`.

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

- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Terminal Usage Guide](docs/TERMINAL_README.md) - Commands, customization, and features
- [Architecture Deep Dive](docs/ARCHITECTURE.md) - Technical implementation details
- [Cloudflare Deployment](docs/CLOUDFLARE_DEPLOYMENT.md) - Production deployment guide
- [Color Codes Reference](docs/COLOR_CODES.md) - ANSI color code documentation
- [Test Coverage](docs/TEST_COVERAGE.md) - Testing strategy and coverage details

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
npm run test:unit -- --run

# Type checking and linting
npm run check
npm run lint

# Run e2e tests
npm run test:e2e

# Run all tests
npm test
```

**Test Coverage**: Comprehensive test suite covering commands, ANSI parsing, session management, file operations, and API endpoints. See [docs/TEST_COVERAGE.md](docs/TEST_COVERAGE.md) for details.

## 📦 Deployment

### Cloudflare Workers

See [docs/CLOUDFLARE_DEPLOYMENT.md](docs/CLOUDFLARE_DEPLOYMENT.md) for complete deployment instructions.

```sh
# Build and deploy
npm run deploy
```

### Test Production Build Locally

```sh
# Build and run with Wrangler (local KV)
npm run preview
```

## 🛠️ Tech Stack

- **Framework**: SvelteKit 3 with Svelte 5 Runes
- **Styling**: Tailwind CSS v4
- **Storage**: Cloudflare KV
- **Markdown**: marked 18, with sanitized HTML output
- **Testing**: Vitest 5 + Playwright
- **Deployment**: Cloudflare Workers behind Caddy (deSEC DNS)
- **Language**: TypeScript 6 (strict mode)
