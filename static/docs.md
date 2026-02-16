# Documentation

## Command Reference

### Basic Commands

- `help` - Show all available commands
- `clear` - Clear the terminal screen
- `neofetch` - Display system information with ASCII art

### File System Commands

- `ls` - List all available files in the static directory
- `cat <file>` - Display contents of a file from static folder
  - Supports markdown files with full rendering
  - Use `ls` to see available files

### Information Commands

- `date` - Show current date and time
- `echo <text>` - Echo back the provided text

### Network Commands

- `ping` - Test connectivity (returns "pong")

### Demo Commands

- `links` - Demo of clickable links (commands and URLs)
- `colors` - Demo ANSI color codes

## File System

You can read markdown files using the `cat` command:
```
$ cat about.md
$ cat docs.md
```

Files are served from the `/static` folder.

## Color Codes

See `COLOR_CODES.md` in the project root for full ANSI color reference.

## Keyboard Shortcuts

- `Enter` - Submit command
- `Click anywhere` - Focus input
- `Space/Enter on terminal area` - Focus input

## Testing

Run the test suite:
```
npm run test:unit
```

**68 tests** covering:
- Command execution
- ANSI color parsing
- Session management
- File operations
- API endpoints

---

Built with ❤️ using SvelteKit 5
