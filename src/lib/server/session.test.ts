import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSessionId, getOrCreateSessionId } from './session';
import type { Cookies } from '@sveltejs/kit';

describe('session', () => {
	describe('generateSessionId', () => {
		it('should generate a valid UUID', () => {
			const id = generateSessionId();
			// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
			expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});

		it('should generate unique IDs', () => {
			const id1 = generateSessionId();
			const id2 = generateSessionId();
			const id3 = generateSessionId();
			expect(id1).not.toBe(id2);
			expect(id2).not.toBe(id3);
			expect(id1).not.toBe(id3);
		});

		it('should generate IDs of correct length', () => {
			const id = generateSessionId();
			expect(id.length).toBe(36); // UUID format length
		});
	});

	describe('getOrCreateSessionId', () => {
		let mockCookies: Cookies;

		beforeEach(() => {
			mockCookies = {
				get: vi.fn(),
				set: vi.fn(),
				delete: vi.fn(),
				serialize: vi.fn(),
				getAll: vi.fn()
			} as unknown as Cookies;
		});

		it('should return existing session ID from cookies', () => {
			const existingId = 'existing-session-id';
			vi.mocked(mockCookies.get).mockReturnValue(existingId);

			const result = getOrCreateSessionId(mockCookies);
			expect(result).toBe(existingId);
			expect(mockCookies.get).toHaveBeenCalledWith('session-id');
			expect(mockCookies.set).not.toHaveBeenCalled();
		});

		it('should create new session ID when cookie does not exist', () => {
			vi.mocked(mockCookies.get).mockReturnValue(undefined);

			const result = getOrCreateSessionId(mockCookies);
			expect(result).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
			);
			expect(mockCookies.set).toHaveBeenCalledWith('session-id', result, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: true,
				secure: false, // false in test environment
				sameSite: 'lax'
			});
		});

		it('should set secure cookie in production', () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			vi.mocked(mockCookies.get).mockReturnValue(undefined);

			const result = getOrCreateSessionId(mockCookies);
			expect(mockCookies.set).toHaveBeenCalledWith(
				'session-id',
				result,
				expect.objectContaining({
					secure: true
				})
			);

			process.env.NODE_ENV = originalEnv;
		});

		it('should set cookie with correct expiration (1 year)', () => {
			vi.mocked(mockCookies.get).mockReturnValue(undefined);

			const result = getOrCreateSessionId(mockCookies);
			expect(mockCookies.set).toHaveBeenCalledWith(
				'session-id',
				result,
				expect.objectContaining({
					maxAge: 60 * 60 * 24 * 365
				})
			);
		});

		it('should set httpOnly cookie', () => {
			vi.mocked(mockCookies.get).mockReturnValue(undefined);

			const result = getOrCreateSessionId(mockCookies);
			expect(mockCookies.set).toHaveBeenCalledWith(
				'session-id',
				result,
				expect.objectContaining({
					httpOnly: true
				})
			);
		});

		it('should set sameSite to lax', () => {
			vi.mocked(mockCookies.get).mockReturnValue(undefined);

			const result = getOrCreateSessionId(mockCookies);
			expect(mockCookies.set).toHaveBeenCalledWith(
				'session-id',
				result,
				expect.objectContaining({
					sameSite: 'lax'
				})
			);
		});

		it('should set cookie path to root', () => {
			vi.mocked(mockCookies.get).mockReturnValue(undefined);

			const result = getOrCreateSessionId(mockCookies);
			expect(mockCookies.set).toHaveBeenCalledWith(
				'session-id',
				result,
				expect.objectContaining({
					path: '/'
				})
			);
		});

		it('should handle empty string as no session', () => {
			vi.mocked(mockCookies.get).mockReturnValue('');

			const result = getOrCreateSessionId(mockCookies);
			expect(mockCookies.set).toHaveBeenCalled();
			expect(result).not.toBe('');
		});
	});
});
