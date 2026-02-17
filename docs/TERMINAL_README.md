# Terminal Component

A clean, modular terminal interface built with SvelteKit 5 and Tailwind CSS.

## Features

- 🎨 Dark/Light mode support with system preference detection
- 📝 Neofetch-style ASCII art greeting
- ⚙️ JSON-configurable commands
- 🔗 Clickable links (commands and URLs)
- 📁 File system commands (cat, ls) with markdown rendering
- 🌈 ANSI color code support (16 colors)
- 🧩 Modular component architecture
- 🎯 Full TypeScript support
- ♿ Accessibility compliant
- 🚀 **Works without JavaScript** - Progressive enhancement with SSR
- ☁️ **Cloudflare KV storage** - Unlimited command history
- ⚡ **Real-time persistence** - History saved after every command in JS mode
- 🔒 **Security** - HTML sanitization, httpOnly cookies, session-based auth

## Project Structure

```
src/
├── lib/
│   ├── commands.json              # Command definitions
│   ├── commands-utils.ts          # Shared command execution logic
│   ├── ansi-colors.ts             # ANSI color parsing
│   ├── types/
│   │   └── terminal.ts            # TypeScript interfaces
│   ├── components/
│   │   ├── TerminalHeader.svelte  # Header with theme toggle
│   │   ├── TerminalOutput.svelte  # History display with ANSI colors
│   │   └── TerminalInput.svelte   # Input line with custom cursor
│   └── server/
│       └── session.ts             # Session ID and cookie management
└── routes/
    ├── Terminal.svelte            # Rich client-side terminal component
    ├── +page.svelte               # Hybrid page (JS/no-JS detection)
    ├── +page.server.ts            # SSR load, execute, and persist actions
    ├── +page.ts                   # SSR configuration
    ├── layout.css                 # Global styles
    └── api/
        └── files/
            └── +server.ts         # File listing API endpoint
static/
├── about.md                       # Sample markdown file
└── docs.md                        # Documentation file
```

## Progressive Enhancement

The terminal works perfectly **without JavaScript**:

- **SSR**: Initial page load renders full terminal history
- **Cookies**: Command history and theme persisted server-side
- **Forms**: Commands submitted via standard HTML forms
- **Noscript**: Submit button appears when JS is disabled
- **Enhanced**: With JS enabled, uses `enhance()` for smooth transitions

### Without JavaScript

- Full form submission on Enter
- Visible "Run" button for command execution
- Server-side command execution
- Page reload with updated state

### With JavaScript (Enhanced)

- AJAX form submissions (no page reload)
- Auto-focus on input
- Custom blinking cursor with accurate positioning
- Smooth transitions
- **Real-time persistence**: History saved via `persist` action after every command
- Enhanced link interactions (preventDefault on forms)
- Client-side markdown rendering
- Instant theme switching

> **Technical Detail**: The JS-enhanced terminal uses a dedicated `persist` action to save history asynchronously without blocking user interaction. See [ARCHITECTURE.md](ARCHITECTURE.md#persist-action-async-history-saving) for implementation details.

## Adding New Commands

Edit `src/lib/commands.json`:

```json
{
	"commands": {
		"yourcommand": {
			"description": "What your command does",
			"response": "Static response text"
		},
		"dynamic": {
			"description": "Command with dynamic response",
			"response": "dynamic"
		},
		"withlinks": {
			"description": "Command with clickable links",
			"response": "Check out these links:",
			"links": [
				{
					"text": "Run another command",
					"type": "command",
					"target": "ping"
				},
				{
					"text": "Visit website",
					"type": "url",
					"target": "https://example.com"
				}
			]
		}
	}
}
```

For dynamic commands, add the logic in `src/lib/commands-utils.ts`:

```typescript
export async function executeCommand(
	cmd: string,
	args: string[],
	options?: { fetch?: (url: string) => Promise<Response> }
): Promise<{ output: string; links?: Link[]; isGreeting?: boolean; isHtml?: boolean }> {
	const command = config.commands[cmd.toLowerCase()];

	if (command.response === 'dynamic') {
		switch (cmd.toLowerCase()) {
			case 'yourcommand':
				return { output: `Dynamic response: ${args.join(' ')}` };
		}
	}
}
```

## Available Commands

### Built-in Commands

- `ping` - Test connectivity (returns "pong")
- `help` - List all available commands with descriptions
- `clear` - Clear the terminal screen
- `echo [text]` - Echo back the provided text
- `date` - Display current date and time
- `neofetch` - Display the ASCII art greeting again

### File System Commands

- `ls` - List all files in the static directory
- `cat <filename>` - Display file contents (supports .md rendering)

> **Note**: File listing uses a custom Vite plugin that reads the `/static` directory at build time, enabling the `ls` command to work on Cloudflare Workers where runtime filesystem access is unavailable. See [ARCHITECTURE.md](ARCHITECTURE.md#virtual-static-files-plugin) for implementation details.

### Demo Commands

- `colors` - Show all available ANSI color codes

## Link Types

Commands can include clickable links in their responses:

- **Command links** (`type: "command"`) - Execute another terminal command when clicked
- **URL links** (`type: "url"`) - Open a URL in a new tab when clicked

Links are defined in the `links` array of a command and are rendered as clickable elements below the command output.

## Development

```bash
npm run dev
```

## Customization

### Styling

All components use Tailwind CSS classes. Modify colors and styles directly in the component files.

### Greeting

Edit the `greeting` property in `src/lib/commands.json`.

### Theme Colors

Adjust Tailwind color classes in:

- `TerminalHeader.svelte` - Header colors
- `TerminalOutput.svelte` - Text colors
- `Terminal.svelte` - Background colors

## Markdown Rendering

The terminal supports markdown file rendering:

1. Place `.md` files in the `static/` directory
2. Use `cat filename.md` to render them
3. Markdown is parsed with `marked` library
4. Custom CSS styles applied for headings, lists, code blocks, etc.

**Security**: Markdown is rendered using the `marked` library which has built-in XSS protection.

## Persistence

### Storage Architecture

The terminal uses a dual storage strategy:

- **Production (Cloudflare)**: KV storage with 100-entry limit, 7-day TTL
- **Local Development**: Cookie storage with 20-entry limit (4KB browser limit)

Cookie storage includes **automatic fallback logic**: if the history exceeds the 4KB cookie limit, it automatically reduces to the last 20 entries.

> **Deep Dive**: See [ARCHITECTURE.md](ARCHITECTURE.md#storage-architecture) for complete details on storage mechanisms, fallback logic, and session management.

### Without JavaScript

- History stored in cookies (max 20 entries due to 4KB cookie limit)
- Submitted via form actions to server
- Theme preference in separate cookie

### With JavaScript

- History stored in Cloudflare KV (unlimited size)
- Saved automatically after every command
- Session-based with UUID session IDs
- Greeting always displayed on load but not persisted

### Local Development

- Use `npm run dev` for development (uses cookie fallback)
- Use `npm run preview` to test with Wrangler and local KV
- Wrangler provides local KV in `.wrangler/state`
