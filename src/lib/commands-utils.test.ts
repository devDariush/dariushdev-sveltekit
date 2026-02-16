import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeCommand } from './commands-utils';

vi.mock('marked', () => ({
	marked: (content: string) => Promise.resolve(`<h1>${content}</h1>`)
}));

vi.mock('isomorphic-dompurify', () => ({
	default: { sanitize: (html: string) => html },
	sanitize: (html: string) => html
}));

describe('commands-utils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('executeCommand', () => {
		it('should return error for unknown command', async () => {
			const result = await executeCommand('unknown', []);
			expect(result.output).toBe('Command not found: unknown');
		});

		it('should handle clear command', async () => {
			const result = await executeCommand('clear', []);
			expect(result.output).toBe('');
			expect(result.links).toEqual([]);
		});

		it('should handle ping command', async () => {
			const result = await executeCommand('ping', []);
			expect(result.output).toBe('pong');
		});

		it('should handle help command', async () => {
			const result = await executeCommand('help', []);
			expect(result.output).toContain('Available commands:');
			expect(result.output).toContain('ping');
			expect(result.output).toContain('help');
			expect(result.output).toContain('clear');
		});

		it('should handle echo command with arguments', async () => {
			const result = await executeCommand('echo', ['hello', 'world']);
			expect(result.output).toBe('hello world');
		});

		it('should handle echo command with no arguments', async () => {
			const result = await executeCommand('echo', []);
			expect(result.output).toBe('');
		});

		it('should handle echo command with special characters', async () => {
			const result = await executeCommand('echo', ['Hello,', 'World!', '$PATH']);
			expect(result.output).toBe('Hello, World! $PATH');
		});

		it('should handle date command', async () => {
			const result = await executeCommand('date', []);
			expect(result.output).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Basic date format check
		});

		it('should handle neofetch command', async () => {
			const result = await executeCommand('neofetch', []);
			expect(result.output).toContain('Dariush');
			expect(result.output).toContain('HHU');
			expect(result.links).toBeDefined();
			expect(Array.isArray(result.links)).toBe(true);
			expect(result.isGreeting).toBe(true);
		});

		it('should handle colors command', async () => {
			const result = await executeCommand('colors', []);
			expect(result.output).toContain('\x1b['); // Should contain ANSI codes
		});

		it('should be case insensitive', async () => {
			const result1 = await executeCommand('PING', []);
			const result2 = await executeCommand('ping', []);
			const result3 = await executeCommand('PiNg', []);
			expect(result1.output).toBe('pong');
			expect(result2.output).toBe('pong');
			expect(result3.output).toBe('pong');
		});

		describe('cat command', () => {
			it('should return usage when no filename provided', async () => {
				const result = await executeCommand('cat', []);
				expect(result.output).toContain('Usage: cat <filename>');
				expect(result.output).toContain('Try: cat about.md');
			});

			it('should handle file not found via fetch', async () => {
				const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
				const result = await executeCommand('cat', ['nonexistent.txt'], { fetch: mockFetch });
				expect(result.output).toContain('No such file or directory');
				expect(result.output).toContain('Use "ls" to see available files');
			});

			it('should handle 404 on client', async () => {
				const mockFetch = vi.fn().mockResolvedValue({ ok: false });
				const result = await executeCommand('cat', ['missing.txt'], { fetch: mockFetch });
				expect(result.output).toContain('No such file or directory');
			});

			it('should read markdown files and return sanitized HTML', async () => {
				const mockFetch = vi.fn().mockResolvedValue({
					ok: true,
					text: () => Promise.resolve('# Hello\n\nWorld')
				});
				const result = await executeCommand('cat', ['about.md'], { fetch: mockFetch });
				expect(result.output).toContain('Hello');
				expect(result.isHtml).toBe(true);
			});

			it('should read plain text files without HTML conversion', async () => {
				const mockFetch = vi.fn().mockResolvedValue({
					ok: true,
					text: () => Promise.resolve('plain text content')
				});
				const result = await executeCommand('cat', ['file.txt'], { fetch: mockFetch });
				expect(result.output).toBe('plain text content');
				expect(result.isHtml).toBeUndefined();
			});

			it('should handle fetch errors gracefully', async () => {
				const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
				const result = await executeCommand('cat', ['file.md'], { fetch: mockFetch });
				expect(result.output).toContain('No such file or directory');
			});

			it('should call fetch with correct URL path', async () => {
				const mockFetch = vi.fn().mockResolvedValue({
					ok: true,
					text: () => Promise.resolve('content')
				});
				await executeCommand('cat', ['social.md'], { fetch: mockFetch });
				expect(mockFetch).toHaveBeenCalledWith('/social.md');
			});
		});

		describe('ls command', () => {
			it('should list files from build-time static file list', async () => {
				const result = await executeCommand('ls', []);
				expect(result.output).toContain('about.md');
			});

			it('should list multiple known static files', async () => {
				const result = await executeCommand('ls', []);
				expect(result.output).toContain('contact.md');
				expect(result.output).toContain('social.md');
				expect(result.output).toContain('docs.md');
			});

			it('should not include hidden files', async () => {
				const result = await executeCommand('ls', []);
				const files = result.output.split('\n');
				for (const file of files) {
					expect(file.startsWith('.')).toBe(false);
				}
			});

			it('should return files sorted alphabetically', async () => {
				const result = await executeCommand('ls', []);
				const files = result.output.split('\n');
				const sorted = [...files].sort();
				expect(files).toEqual(sorted);
			});

			it('should work without isServer option', async () => {
				// ls no longer needs isServer - uses build-time file list
				const result1 = await executeCommand('ls', []);
				const result2 = await executeCommand('ls', [], { isServer: true });
				const result3 = await executeCommand('ls', [], { isServer: false });
				expect(result1.output).toBe(result2.output);
				expect(result2.output).toBe(result3.output);
			});
		});
	});
});
