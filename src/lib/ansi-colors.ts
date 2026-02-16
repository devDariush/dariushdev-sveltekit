/**
 * Parse ANSI color codes and convert to HTML with Tailwind classes
 * Supports basic ANSI color codes like \x1b[31m for red, \x1b[0m for reset
 */

interface ColorSegment {
	text: string;
	color?: string;
}

const ansiColors: Record<string, string> = {
	'30': 'text-black dark:text-gray-800',
	'31': 'text-red-600 dark:text-red-400',
	'32': 'text-green-600 dark:text-green-400',
	'33': 'text-yellow-600 dark:text-yellow-400',
	'34': 'text-blue-600 dark:text-blue-400',
	'35': 'text-magenta-600 dark:text-magenta-400',
	'36': 'text-cyan-600 dark:text-cyan-400',
	'37': 'text-white dark:text-gray-100',
	'90': 'text-gray-600 dark:text-gray-400',
	'91': 'text-red-500 dark:text-red-300',
	'92': 'text-green-500 dark:text-green-300',
	'93': 'text-yellow-500 dark:text-yellow-300',
	'94': 'text-blue-500 dark:text-blue-300',
	'95': 'text-magenta-500 dark:text-magenta-300',
	'96': 'text-cyan-500 dark:text-cyan-300',
	'97': 'text-gray-100 dark:text-white'
};

/**
 * Parse ANSI escape sequences into colored segments
 */
export function parseAnsi(text: string): ColorSegment[] {
	const segments: ColorSegment[] = [];
	// eslint-disable-next-line no-control-regex
	const ansiRegex = /\x1b\[(\d+)m/g;

	let lastIndex = 0;
	let currentColor: string | undefined;
	let match: RegExpExecArray | null;

	while ((match = ansiRegex.exec(text)) !== null) {
		// Add text before this code
		if (match.index > lastIndex) {
			segments.push({
				text: text.slice(lastIndex, match.index),
				color: currentColor
			});
		}

		// Update color
		const code = match[1];
		if (code === '0') {
			currentColor = undefined; // Reset
		} else {
			currentColor = ansiColors[code];
		}

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		segments.push({
			text: text.slice(lastIndex),
			color: currentColor
		});
	}

	return segments.length > 0 ? segments : [{ text }];
}

/**
 * Check if text contains ANSI codes
 */
export function hasAnsiCodes(text: string): boolean {
	// eslint-disable-next-line no-control-regex
	return /\x1b\[\d+m/.test(text);
}
