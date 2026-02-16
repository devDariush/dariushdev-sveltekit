import type { Cookies } from '@sveltejs/kit';

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
	return crypto.randomUUID();
}

/**
 * Get or create a session ID from cookies
 */
export function getOrCreateSessionId(cookies: Cookies): string {
	let sessionId = cookies.get('session-id');

	if (!sessionId) {
		sessionId = generateSessionId();
		cookies.set('session-id', sessionId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});
	}

	return sessionId;
}
