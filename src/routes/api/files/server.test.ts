import { describe, it, expect } from 'vitest';
import { GET } from './+server';

describe('/api/files endpoint', () => {
	it('should return list of files', async () => {
		const response = await GET({} as never);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThan(0);
	});

	it('should include known static files', async () => {
		const response = await GET({} as never);
		const data = await response.json();

		expect(data).toContain('about.md');
		expect(data).toContain('contact.md');
		expect(data).toContain('social.md');
	});

	it('should not include hidden files', async () => {
		const response = await GET({} as never);
		const data = await response.json();

		for (const file of data) {
			expect(file.startsWith('.')).toBe(false);
		}
	});

	it('should return files sorted alphabetically', async () => {
		const response = await GET({} as never);
		const data = await response.json();

		const sorted = [...data].sort();
		expect(data).toEqual(sorted);
	});

	it('should return JSON content type', async () => {
		const response = await GET({} as never);
		expect(response.headers.get('content-type')).toContain('application/json');
	});

	it('should return only string entries', async () => {
		const response = await GET({} as never);
		const data = await response.json();

		for (const item of data) {
			expect(typeof item).toBe('string');
		}
	});

	it('should not include directories', async () => {
		const response = await GET({} as never);
		const data = await response.json();

		// All entries should have file extensions (no bare directory names)
		for (const item of data) {
			expect(item).toMatch(/\.\w+$/);
		}
	});

	it('should return consistent results across calls', async () => {
		const response1 = await GET({} as never);
		const data1 = await response1.json();

		const response2 = await GET({} as never);
		const data2 = await response2.json();

		expect(data1).toEqual(data2);
	});

	it('should include markdown files', async () => {
		const response = await GET({} as never);
		const data = await response.json();

		const mdFiles = data.filter((f: string) => f.endsWith('.md'));
		expect(mdFiles.length).toBeGreaterThan(0);
	});
});
