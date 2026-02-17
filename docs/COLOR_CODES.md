# Color Coding in Commands

You can use ANSI color codes in your command responses in `commands.json` to add colors to terminal output.

## Supported Colors

| Code         | Color          | Example                             |
| ------------ | -------------- | ----------------------------------- |
| `\u001b[30m` | Black          | `\u001b[30mBlack text\u001b[0m`     |
| `\u001b[31m` | Red            | `\u001b[31mRed text\u001b[0m`       |
| `\u001b[32m` | Green          | `\u001b[32mGreen text\u001b[0m`     |
| `\u001b[33m` | Yellow         | `\u001b[33mYellow text\u001b[0m`    |
| `\u001b[34m` | Blue           | `\u001b[34mBlue text\u001b[0m`      |
| `\u001b[35m` | Magenta        | `\u001b[35mMagenta text\u001b[0m`   |
| `\u001b[36m` | Cyan           | `\u001b[36mCyan text\u001b[0m`      |
| `\u001b[37m` | White          | `\u001b[37mWhite text\u001b[0m`     |
| `\u001b[90m` | Gray           | `\u001b[90mGray text\u001b[0m`      |
| `\u001b[91m` | Bright Red     | `\u001b[91mBright red\u001b[0m`     |
| `\u001b[92m` | Bright Green   | `\u001b[92mBright green\u001b[0m`   |
| `\u001b[93m` | Bright Yellow  | `\u001b[93mBright yellow\u001b[0m`  |
| `\u001b[94m` | Bright Blue    | `\u001b[94mBright blue\u001b[0m`    |
| `\u001b[95m` | Bright Magenta | `\u001b[95mBright magenta\u001b[0m` |
| `\u001b[96m` | Bright Cyan    | `\u001b[96mBright cyan\u001b[0m`    |
| `\u001b[97m` | Bright White   | `\u001b[97mBright white\u001b[0m`   |
| `\u001b[0m`  | Reset          | Always use to reset colors          |

## Usage in commands.json

```json
{
	"commands": {
		"status": {
			"description": "Show status",
			"response": "\u001b[32m✓\u001b[0m All systems operational\n\u001b[33m⚠\u001b[0m 2 warnings\n\u001b[31m✗\u001b[0m 0 errors"
		}
	}
}
```

## Important Notes

- Always use `\u001b[0m` to reset colors at the end
- Colors automatically adapt to dark/light mode
- Works in both JS and NoJS modes

## Try It

Run `colors` command to see all available colors in action!
