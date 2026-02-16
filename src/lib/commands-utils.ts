import terminalConfig from '$lib/commands.json';
import type { TerminalConfig, Link } from '$lib/types/terminal';
import { staticFiles } from 'virtual:static-files';

const config = terminalConfig as TerminalConfig;

// Type for Cloudflare Assets fetcher
type AssetsFetcher = { fetch: (request: Request) => Promise<Response> };

/**
 * Execute a terminal command and return output
 * Shared logic used by both server and client
 */
export async function executeCommand(
	cmd: string,
	args: string[],
	options?: { fetch?: typeof globalThis.fetch; url?: URL; assets?: AssetsFetcher }
): Promise<{ output: string; links?: Link[]; isGreeting?: boolean; isHtml?: boolean }> {
	const fetchFn = options?.fetch ?? globalThis.fetch;
	const baseUrl = options?.url;
	const assetsFetch = options?.assets;
	const command = config.commands[cmd.toLowerCase()];

	if (!command) {
		return { output: `Command not found: ${cmd}` };
	}

	if (command.action === 'clear') {
		return { output: '', links: [] };
	}

	if (command.response === 'dynamic') {
		switch (cmd.toLowerCase()) {
			case 'help':
				return {
					output:
						'Available commands:\n' +
						Object.entries(config.commands)
							.map(([name, cmd]) => `  ${name.padEnd(12)} - ${cmd.description}`)
							.join('\n')
				};
			case 'echo':
				return { output: args.join(' ') };
			case 'date':
				return { output: new Date().toLocaleString() };
			case 'neofetch': {
				return { output: config.greeting, links: config.greetingLinks, isGreeting: true };
			}
			case 'ls': {
				if (staticFiles.length === 0) {
					return { output: 'No files available' };
				}
				return { output: staticFiles.join('\n') };
			}
			case 'cat': {
				if (args.length === 0) {
					return {
						output:
							'Usage: cat <filename>\n\nTry: cat about.md, cat social.md, or cat contact.md\nUse "ls" to see all available files'
					};
				}
				const filename = args[0];

				try {
					// Use Cloudflare ASSETS binding if available (server-side), otherwise use fetch
					let response: Response;
					if (assetsFetch) {
						// Cloudflare Workers: use ASSETS.fetch for static files
						response = await assetsFetch.fetch(new Request(`https://placeholder/${filename}`));
					} else {
						// Client-side or local dev: use regular fetch
						const fileUrl = baseUrl ? new URL(`/${filename}`, baseUrl).href : `/${filename}`;
						response = await fetchFn(fileUrl);
					}

					if (!response.ok) {
						return {
							output: `cat: ${filename}: No such file or directory (HTTP ${response.status})\n\nUse "ls" to see available files`
						};
					}
					const content = await response.text();

					// If it's a markdown file, parse it to HTML
					if (filename.endsWith('.md')) {
						const { marked } = await import('marked');
						const html = await marked(content);
						return { output: html, isHtml: true };
					}

					return { output: content };
				} catch (error) {
					return {
						output: `cat: ${filename}: Error - ${error instanceof Error ? error.message : String(error)}\n\nUse "ls" to see available files`
					};
				}
			}
			default:
				return { output: '' };
		}
	}

	return { output: command.response || '', links: command.links };
}

export { config };
