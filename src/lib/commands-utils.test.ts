import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeCommand } from './commands-utils';

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

			it('should handle file not found on server', async () => {
				const result = await executeCommand('cat', ['nonexistent.txt'], { isServer: true });
				expect(result.output).toContain('No such file or directory');
				expect(result.output).toContain('Use "ls" to see available files');
			});

			it('should handle 404 on client', async () => {
				const mockFetch = vi.fn().mockResolvedValue({ ok: false });
				global.fetch = mockFetch;

				const result = await executeCommand('cat', ['missing.txt'], { isServer: false });
				expect(result.output).toContain('No such file or directory');
			});
		});

		describe('ls command', () => {
			it('should list files on server', async () => {
				const result = await executeCommand('ls', [], { isServer: true });
				// In test environment, will actually read the static directory
				expect(result.output).toContain('about.md'); // At least one file should exist
			});

			it('should handle fetch error on client', async () => {
				const mockFetch = vi.fn().mockResolvedValue({ ok: false });
				global.fetch = mockFetch;

				const result = await executeCommand('ls', [], { isServer: false });
				expect(result.output).toBe('Error listing files');
			});

			it('should handle empty file list on client', async () => {
				const mockFetch = vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve([])
				});
				global.fetch = mockFetch;

				const result = await executeCommand('ls', [], { isServer: false });
				expect(result.output).toBe('No files available');
			});

			it('should fetch file list on client', async () => {
				const mockFetch = vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve(['file1.txt', 'file2.md'])
				});
				global.fetch = mockFetch;

				const result = await executeCommand('ls', [], { isServer: false });
				expect(result.output).toBe('file1.txt\nfile2.md');
				expect(mockFetch).toHaveBeenCalledWith('/api/files');
			});
		});
	});
});
