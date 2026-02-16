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
- **Real-time persistence**: History saved to KV after every command
- Enhanced link interactions (preventDefault on forms)
- Client-side markdown rendering
- Instant theme switching

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

For dynamic commands, add the logic in `Terminal.svelte`:

```typescript
function executeCommand(cmd: string, args: string[]): string {
	const command = config.commands[cmd.toLowerCase()];

	if (command.response === 'dynamic') {
		switch (cmd.toLowerCase()) {
			case 'yourcommand':
				return `Dynamic response: ${args.join(' ')}`;
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

### Demo Commands

- `links` - Demonstrate clickable command and URL links
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
3. Markdown is parsed with `marked` and sanitized with `DOMPurify`
4. Custom CSS styles applied for headings, lists, code blocks, etc.

**Security**: All HTML output is sanitized to prevent XSS attacks.

## Persistence

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

- Use `npm run dev:cf` to test with local KV storage
- Fallback to cookies when KV is unavailable
- Wrangler provides local KV in `.wrangler/state`
