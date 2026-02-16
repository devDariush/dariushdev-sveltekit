import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './+server';

// Mock fs/promises
vi.mock('fs/promises', () => ({
	default: {
		readdir: vi.fn()
	}
}));

// Mock Dirent type for testing
interface MockDirent {
	name: string;
	isFile: () => boolean;
}

describe('/api/files endpoint', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		const fs = await import('fs/promises');
		// Default mock: return empty array
		vi.mocked(fs.default.readdir).mockResolvedValue([]);
	});

	it('should return list of files', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([
			{ name: 'file1.txt', isFile: () => true } as MockDirent,
			{ name: 'file2.md', isFile: () => true } as MockDirent,
			{ name: 'about.md', isFile: () => true } as MockDirent
		] as never);

		const response = await GET({} as never);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual(['about.md', 'file1.txt', 'file2.md']);
	});

	it('should filter out hidden files', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([
			{ name: 'visible.txt', isFile: () => true } as MockDirent,
			{ name: '.hidden', isFile: () => true } as MockDirent,
			{ name: '.gitignore', isFile: () => true } as MockDirent
		] as never);

		const response = await GET({} as never);
		const data = await response.json();

		expect(data).toEqual(['visible.txt']);
		expect(data).not.toContain('.hidden');
		expect(data).not.toContain('.gitignore');
	});

	it('should filter out directories', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([
			{ name: 'file.txt', isFile: () => true } as MockDirent,
			{ name: 'folder', isFile: () => false } as MockDirent,
			{ name: 'another-folder', isFile: () => false } as MockDirent
		] as never);

		const response = await GET({} as never);
		const data = await response.json();

		expect(data).toEqual(['file.txt']);
		expect(data).not.toContain('folder');
	});

	it('should sort files alphabetically', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([
			{ name: 'zebra.txt', isFile: () => true } as MockDirent,
			{ name: 'apple.md', isFile: () => true } as MockDirent,
			{ name: 'banana.txt', isFile: () => true } as MockDirent
		] as never);

		const response = await GET({} as never);
		const data = await response.json();

		expect(data).toEqual(['apple.md', 'banana.txt', 'zebra.txt']);
	});

	it('should return empty array when no files exist', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([]);

		const response = await GET({} as never);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([]);
	});

	it('should return empty array when only directories exist', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([
			{ name: 'folder1', isFile: () => false } as MockDirent,
			{ name: 'folder2', isFile: () => false } as MockDirent
		] as never);

		const response = await GET({} as never);
		const data = await response.json();

		expect(data).toEqual([]);
	});

	it('should handle readdir errors', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockRejectedValue(new Error('Permission denied'));

		const response = await GET({} as never);

		expect(response.status).toBe(500);
		const data = await response.json();
		expect(data).toEqual([]);
	});

	it('should handle filesystem errors gracefully', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockRejectedValue(new Error('ENOENT'));

		const response = await GET({} as never);

		expect(response.status).toBe(500);
	});

	it('should handle mixed file types correctly', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([
			{ name: 'text.txt', isFile: () => true } as MockDirent,
			{ name: 'doc.md', isFile: () => true } as MockDirent,
			{ name: 'folder', isFile: () => false } as MockDirent,
			{ name: '.hidden', isFile: () => true } as MockDirent,
			{ name: 'image.png', isFile: () => true } as MockDirent
		] as never);

		const response = await GET({} as never);
		const data = await response.json();

		expect(data).toEqual(['doc.md', 'image.png', 'text.txt']);
	});

	it('should handle files with special characters', async () => {
		const fs = await import('fs/promises');
		vi.mocked(fs.default.readdir).mockResolvedValue([
			{ name: 'file with spaces.txt', isFile: () => true } as MockDirent,
			{ name: 'file-with-dashes.md', isFile: () => true } as MockDirent,
			{ name: 'file_with_underscores.txt', isFile: () => true } as MockDirent
		] as never);

		const response = await GET({} as never);
		const data = await response.json();

		expect(data).toContain('file with spaces.txt');
		expect(data).toContain('file-with-dashes.md');
		expect(data).toContain('file_with_underscores.txt');
	});
});
