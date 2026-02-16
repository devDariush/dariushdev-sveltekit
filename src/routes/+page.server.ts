import type { HistoryEntry } from '$lib/types/terminal';
import type { Actions, PageServerLoad } from './$types';
import { getOrCreateSessionId } from '$lib/server/session';
import { executeCommand, config } from '$lib/commands-utils';

const MAX_HISTORY = 100;

const GREETING_ENTRY: HistoryEntry = {
	type: 'greeting',
	content: config.greeting,
	links: config.greetingLinks
};

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = getOrCreateSessionId(cookies);
	const darkModeCookie = cookies.get('dark-mode');

	let history: HistoryEntry[] = [GREETING_ENTRY];

	// Try to load from KV if available (Cloudflare), otherwise use cookies for local dev
	if (platform?.env?.TERMINAL_KV) {
		try {
			const savedHistory = await platform.env.TERMINAL_KV.get(`history:${sessionId}`, 'json');
			if (savedHistory && Array.isArray(savedHistory)) {
				history = [GREETING_ENTRY, ...savedHistory];
			}
		} catch (error) {
			console.error('Error loading from KV:', error);
		}
	} else {
		// Fallback to cookies for local development
		const historyJson = cookies.get('terminal-history');
		if (historyJson) {
			try {
				const savedHistory = JSON.parse(historyJson);
				history = [GREETING_ENTRY, ...savedHistory];
			} catch {
				history = [GREETING_ENTRY];
			}
		}
	}

	return {
		history,
		darkMode: darkModeCookie === 'true' || darkModeCookie === null,
		greeting: config.greeting
	};
};

export const actions = {
	execute: async ({ request, cookies, platform, fetch: eventFetch }) => {
		const sessionId = getOrCreateSessionId(cookies);

		// Create a fetch function for reading static assets
		// On Cloudflare: use ASSETS binding (works in Workers/NoJS)
		// Locally: use SvelteKit's event.fetch
		const assets = platform?.env?.ASSETS;
		const assetFetch = assets
			? (url: string) => assets.fetch(new URL(url, request.url))
			: (url: string) => eventFetch(url);
		const data = await request.formData();
		const command = data.get('command')?.toString() || '';
		const action = data.get('action')?.toString();

		let history: HistoryEntry[] = [];

		// Load history from KV or cookies
		if (platform?.env?.TERMINAL_KV) {
			try {
				const savedHistory = await platform.env.TERMINAL_KV.get(`history:${sessionId}`, 'json');
				if (savedHistory && Array.isArray(savedHistory)) {
					history = savedHistory;
				}
			} catch (error) {
				console.error('Error loading from KV:', error);
			}
		} else {
			// Fallback to cookies for local development
			const historyJson = cookies.get('terminal-history');
			if (historyJson) {
				try {
					history = JSON.parse(historyJson);
				} catch {
					history = [];
				}
			}
		}

		if (action === 'toggle-theme') {
			const currentDarkMode = cookies.get('dark-mode');
			const newDarkMode = currentDarkMode === 'false' ? 'true' : 'false';
			cookies.set('dark-mode', newDarkMode, { path: '/', maxAge: 60 * 60 * 24 * 365 });
			return { success: true, darkMode: newDarkMode === 'true' };
		}

		if (action === 'link-click') {
			const linkType = data.get('link-type')?.toString();
			const linkTarget = data.get('link-target')?.toString();

			if (linkType === 'command' && linkTarget) {
				// Execute the linked command
				history.push({ type: 'command', content: `$ ${linkTarget}` });

				const [cmd, ...args] = linkTarget.split(/\s+/);
				const commandConfig = config.commands[cmd.toLowerCase()];

				if (commandConfig?.action === 'clear') {
					history = []; // Save empty, load function will add greeting
				} else {
					const result = await executeCommand(cmd, args, { isServer: true, fetch: assetFetch });
					if (result.output) {
						history.push({
							type: result.isGreeting ? 'greeting' : 'output',
							content: result.output,
							links: result.links,
							isGreeting: result.isGreeting,
							isHtml: result.isHtml
						});
					}
				}

				// Save and return
				if (history.length > MAX_HISTORY) {
					history = history.slice(-MAX_HISTORY);
				}

				// Save to KV or cookies
				if (platform?.env?.TERMINAL_KV) {
					try {
						await platform.env.TERMINAL_KV.put(
							`history:${sessionId}`,
							JSON.stringify(history),
							{ expirationTtl: 60 * 60 * 24 * 7 } // 7 days
						);
					} catch (error) {
						console.error('Error saving to KV:', error);
					}
				} else {
					// Fallback to cookies for local development
					try {
						cookies.set('terminal-history', JSON.stringify(history), {
							path: '/',
							maxAge: 60 * 60 * 24 * 7
						});
					} catch {
						// If cookie is too large, store less history
						const reducedHistory = history.slice(-20);
						cookies.set('terminal-history', JSON.stringify(reducedHistory), {
							path: '/',
							maxAge: 60 * 60 * 24 * 7
						});
					}
				}
				return { success: true };
			}

			// URL links are handled client-side
			return { success: true };
		}

		// Regular command execution
		if (!command.trim()) {
			return { success: true };
		}

		history.push({ type: 'command', content: `$ ${command}` });

		const [cmd, ...args] = command.split(/\s+/);
		const commandConfig = config.commands[cmd.toLowerCase()];

		if (commandConfig?.action === 'clear') {
			history = []; // Save empty, load function will add greeting
		} else {
			const result = await executeCommand(cmd, args, { isServer: true, fetch: assetFetch });
			if (result.output) {
				history.push({
					type: result.isGreeting ? 'greeting' : 'output',
					content: result.output,
					links: result.links,
					isGreeting: result.isGreeting,
					isHtml: result.isHtml
				});
			}
		}

		// Limit history size
		if (history.length > MAX_HISTORY) {
			history = history.slice(-MAX_HISTORY);
		}

		// Save to KV or cookies
		if (platform?.env?.TERMINAL_KV) {
			try {
				await platform.env.TERMINAL_KV.put(
					`history:${sessionId}`,
					JSON.stringify(history),
					{ expirationTtl: 60 * 60 * 24 * 7 } // 7 days
				);
			} catch (error) {
				console.error('Error saving to KV:', error);
			}
		} else {
			// Fallback to cookies for local development
			try {
				cookies.set('terminal-history', JSON.stringify(history), {
					path: '/',
					maxAge: 60 * 60 * 24 * 7 // 7 days
				});
			} catch {
				// If cookie is too large, store less history
				const reducedHistory = history.slice(-20);
				cookies.set('terminal-history', JSON.stringify(reducedHistory), {
					path: '/',
					maxAge: 60 * 60 * 24 * 7
				});
			}
		}

		return { success: true };
	},
	persist: async ({ request, cookies, platform }) => {
		const sessionId = getOrCreateSessionId(cookies);
		const data = await request.formData();
		const historyJson = data.get('history')?.toString();

		if (!historyJson) {
			return { success: false };
		}

		try {
			const history = JSON.parse(historyJson);

			// Save to KV or cookies
			if (platform?.env?.TERMINAL_KV) {
				try {
					await platform.env.TERMINAL_KV.put(
						`history:${sessionId}`,
						JSON.stringify(history),
						{ expirationTtl: 60 * 60 * 24 * 7 } // 7 days
					);
				} catch (error) {
					console.error('Error saving to KV:', error);
				}
			} else {
				// Fallback to cookies for local development
				try {
					cookies.set('terminal-history', JSON.stringify(history), {
						path: '/',
						maxAge: 60 * 60 * 24 * 7 // 7 days
					});
				} catch {
					// If cookie is too large, store less history
					const reducedHistory = history.slice(-20);
					cookies.set('terminal-history', JSON.stringify(reducedHistory), {
						path: '/',
						maxAge: 60 * 60 * 24 * 7
					});
				}
			}

			return { success: true };
		} catch (error) {
			console.error('Error parsing history:', error);
			return { success: false };
		}
	}
} satisfies Actions;
