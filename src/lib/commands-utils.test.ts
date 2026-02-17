import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeCommand } from './commands-utils';

const markedMock = vi.fn((content: string) => Promise.resolve(`<h1>${content}</h1>`));
(markedMock as unknown as Record<string, unknown>).use = vi.fn().mockReturnValue(undefined);

vi.mock('marked', () => ({
	marked: markedMock
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

			it('should read markdown files and return HTML', async () => {
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

			it('should render cmd:// links as NoJS-compatible forms', async () => {
				const mockFetch = vi.fn().mockResolvedValue({
					ok: true,
					text: () => Promise.resolve('# Hello')
				});
				await executeCommand('cat', ['test.md'], { fetch: mockFetch });

				// Capture the renderer config passed to marked.use
				const useMock = (markedMock as unknown as Record<string, ReturnType<typeof vi.fn>>).use;
				expect(useMock).toHaveBeenCalled();
				const rendererConfig = useMock.mock.calls[0][0] as {
					renderer: { link: (args: { href: string; title: string; text: string }) => string };
				};
				const linkFn = rendererConfig.renderer.link;

				// cmd:// links should render as forms with hidden inputs for NoJS support
				const cmdLink = linkFn({ href: 'cmd://cat%20public.asc', title: '', text: 'PGP Key' });
				expect(cmdLink).toContain('<form method="POST" action="?/execute"');
				expect(cmdLink).toContain('name="action" value="link-click"');
				expect(cmdLink).toContain('name="link-type" value="command"');
				expect(cmdLink).toContain('name="link-target" value="cat public.asc"');
				expect(cmdLink).toContain('class="terminal-cmd-link"');
				expect(cmdLink).toContain('PGP Key</button>');
				expect(cmdLink).not.toContain('target="_blank"');

				// Regular links should still open in a new tab
				const regularLink = linkFn({ href: 'https://example.com', title: '', text: 'Example' });
				expect(regularLink).toContain('target="_blank"');
				expect(regularLink).toContain('rel="noopener noreferrer"');
				expect(regularLink).not.toContain('terminal-cmd-link');
				expect(regularLink).not.toContain('<form');
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

			it('should work without options', async () => {
				// ls doesn't need fetch - uses build-time file list
				const result1 = await executeCommand('ls', []);
				const result2 = await executeCommand('ls', []);
				expect(result1.output).toBe(result2.output);
			});
		});
	});
});
