import terminalConfig from '$lib/commands.json';
import type { TerminalConfig, Link } from '$lib/types/terminal';
import { staticFiles } from 'virtual:static-files';

const config = terminalConfig as TerminalConfig;

/**
 * Execute a terminal command and return output
 * Shared logic used by both server and client
 */
export async function executeCommand(
	cmd: string,
	args: string[],
	options?: { fetch?: typeof globalThis.fetch; url?: URL }
): Promise<{ output: string; links?: Link[]; isGreeting?: boolean; isHtml?: boolean }> {
	const fetchFn = options?.fetch ?? globalThis.fetch;
	const baseUrl = options?.url;
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
					// Use fetch for both server and client (works in Cloudflare Workers)
					// Construct full URL if we have a base URL (server-side)
					const fileUrl = baseUrl ? new URL(`/${filename}`, baseUrl).href : `/${filename}`;
					const response = await fetchFn(fileUrl);
					if (!response.ok) {
						return {
							output: `cat: ${filename}: No such file or directory\n\nUse "ls" to see available files`
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
				} catch {
					return {
						output: `cat: ${filename}: No such file or directory\n\nUse "ls" to see available files`
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
