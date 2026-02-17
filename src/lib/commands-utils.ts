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
	options?: { fetch?: (url: string) => Promise<Response> }
): Promise<{ output: string; links?: Link[]; isGreeting?: boolean; isHtml?: boolean }> {
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
					// Use provided fetch (ASSETS binding on Cloudflare, event.fetch locally)
					// or fall back to globalThis.fetch (client-side)
					const fetchFn = options?.fetch ?? globalThis.fetch;
					const response = await fetchFn(`/${filename}`);
					if (!response.ok) {
						return {
							output: `cat: ${filename}: No such file or directory\n\nUse "ls" to see available files`
						};
					}
					const content = await response.text();

					// If it's a markdown file, parse it to HTML
					if (filename.endsWith('.md')) {
						const { marked } = await import('marked');
						marked.use({
							renderer: {
								link({ href, title, text }) {
									// Command links (cmd://) render as forms for NoJS progressive enhancement
									if (href && href.startsWith('cmd://')) {
										const command = decodeURIComponent(href.slice(6));
										return `<form method="POST" action="?/execute" class="inline-block"><input type="hidden" name="action" value="link-click" /><input type="hidden" name="link-type" value="command" /><input type="hidden" name="link-target" value="${command}" /><button type="submit" class="terminal-cmd-link" title="Run: ${command}">${text}</button></form>`;
									}
									// Regular links open in a new tab
									return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
								}
							}
						});
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
