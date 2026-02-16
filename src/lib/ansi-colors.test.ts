import { describe, it, expect } from 'vitest';
import { parseAnsi, hasAnsiCodes } from './ansi-colors';

describe('ansi-colors', () => {
	describe('parseAnsi', () => {
		it('should parse plain text without ANSI codes', () => {
			const result = parseAnsi('Hello World');
			expect(result).toEqual([{ text: 'Hello World' }]);
		});

		it('should parse single color code', () => {
			const result = parseAnsi('\x1b[31mRed Text\x1b[0m');
			expect(result).toEqual([{ text: 'Red Text', color: 'text-red-600 dark:text-red-400' }]);
		});

		it('should parse multiple color codes', () => {
			const result = parseAnsi('\x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m');
			expect(result).toEqual([
				{ text: 'Red', color: 'text-red-600 dark:text-red-400' },
				{ text: ' ', color: undefined },
				{ text: 'Green', color: 'text-green-600 dark:text-green-400' }
			]);
		});

		it('should handle text before color code', () => {
			const result = parseAnsi('Plain \x1b[34mBlue\x1b[0m');
			expect(result).toEqual([
				{ text: 'Plain ', color: undefined },
				{ text: 'Blue', color: 'text-blue-600 dark:text-blue-400' }
			]);
		});

		it('should handle color without reset', () => {
			const result = parseAnsi('\x1b[36mCyan text continues');
			expect(result).toEqual([
				{ text: 'Cyan text continues', color: 'text-cyan-600 dark:text-cyan-400' }
			]);
		});

		it('should handle all standard colors', () => {
			const colors = [
				{ code: '30', expected: 'text-black dark:text-gray-800' },
				{ code: '31', expected: 'text-red-600 dark:text-red-400' },
				{ code: '32', expected: 'text-green-600 dark:text-green-400' },
				{ code: '33', expected: 'text-yellow-600 dark:text-yellow-400' },
				{ code: '34', expected: 'text-blue-600 dark:text-blue-400' },
				{ code: '35', expected: 'text-magenta-600 dark:text-magenta-400' },
				{ code: '36', expected: 'text-cyan-600 dark:text-cyan-400' },
				{ code: '37', expected: 'text-white dark:text-gray-100' }
			];

			colors.forEach(({ code, expected }) => {
				const result = parseAnsi(`\x1b[${code}mText\x1b[0m`);
				expect(result[0].color).toBe(expected);
			});
		});

		it('should handle empty string', () => {
			const result = parseAnsi('');
			expect(result).toEqual([{ text: '' }]);
		});
	});

	describe('hasAnsiCodes', () => {
		it('should return false for plain text', () => {
			expect(hasAnsiCodes('Hello World')).toBe(false);
		});

		it('should return true for text with ANSI codes', () => {
			expect(hasAnsiCodes('\x1b[31mRed\x1b[0m')).toBe(true);
		});

		it('should return true for text with single ANSI code', () => {
			expect(hasAnsiCodes('\x1b[32mGreen')).toBe(true);
		});

		it('should return false for empty string', () => {
			expect(hasAnsiCodes('')).toBe(false);
		});

		it('should return false for escaped brackets without codes', () => {
			expect(hasAnsiCodes('[31m text')).toBe(false);
		});
	});
});
