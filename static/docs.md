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

- `colors` - Demo ANSI color codes

## File System

You can read markdown files using the `cat` command:
```
$ cat about.md
$ cat docs.md
```

Files are served from the `/static` folder.

## Color Codes

See `docs/COLOR_CODES.md` in the project for full ANSI color reference.

## Keyboard Shortcuts

- `Enter` - Submit command
- `Click anywhere` - Focus input
- `Space/Enter on terminal area` - Focus input

## Source Code

This website is 100% FOSS under the AGPL-3.0 license.
You can find the codebase [in this GitHub repo](https://github.com/devDariush/dariushdev-sveltekit).

---

Built with ❤️ using SvelteKit 5
