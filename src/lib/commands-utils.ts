import terminalConfig from '$lib/commands.json';
import type { TerminalConfig, Link } from '$lib/types/terminal';

const config = terminalConfig as TerminalConfig;

/**
 * Execute a terminal command and return output
 * Shared logic used by both server and client
 */
export async function executeCommand(
	cmd: string,
	args: string[],
	options?: { isServer?: boolean }
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
				const neofetchOutput = [
					'',
					'  \x1b[36mdariush\x1b[0m@\x1b[36mdev\x1b[0m',
					'  ───────────',
					'  \x1b[33mName:\x1b[0m      Dariush Komeili',
					'  \x1b[33mRole:\x1b[0m      CS Student @ HHU',
					'  \x1b[33mLocation:\x1b[0m  Düsseldorf, Germany 🇩🇪',
					'  \x1b[33mInterests:\x1b[0m Privacy · Monero · XR · Backend',
					'  \x1b[33mStack:\x1b[0m     Python · FastAPI · Docker · SvelteKit',
					'  \x1b[33mBlog:\x1b[0m      blog.dariush.dev',
					'  \x1b[33mTerminal:\x1b[0m  dariushdev-sveltekit v1.0',
					''
				].join('\n');
				const neofetchLinks: Link[] = [
					{ text: 'GitHub', type: 'url', target: 'https://github.com/devDariush' },
					{
						text: 'LinkedIn',
						type: 'url',
						target: 'https://www.linkedin.com/in/dariush-komeili-a44796232'
					},
					{ text: 'Bluesky', type: 'url', target: 'https://bsky.app/profile/dariush.dev' },
					{ text: 'Blog', type: 'url', target: 'https://blog.dariush.dev' }
				];
				return { output: neofetchOutput, links: neofetchLinks };
			}
			case 'ls': {
				try {
					let files: string[];

					if (options?.isServer) {
						// Server-side: read static directory
						const fs = await import('fs/promises');
						const path = await import('path');
						const staticDir = path.join(process.cwd(), 'static');
						const entries = await fs.readdir(staticDir, { withFileTypes: true });
						files = entries
							.filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
							.map((entry) => entry.name)
							.sort();
					} else {
						// Client-side: fetch file list from API endpoint
						const response = await fetch('/api/files');
						if (!response.ok) {
							return { output: 'Error listing files' };
						}
						files = await response.json();
					}

					if (files.length === 0) {
						return { output: 'No files available' };
					}

					return { output: files.join('\n') };
				} catch {
					return { output: 'Error listing files' };
				}
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
					let content: string;

					if (options?.isServer) {
						// Server-side: read from static folder using fs
						const fs = await import('fs/promises');
						const path = await import('path');
						const filePath = path.join(process.cwd(), 'static', filename);
						content = await fs.readFile(filePath, 'utf-8');
					} else {
						// Client-side: fetch from static folder
						const response = await fetch(`/${filename}`);
						if (!response.ok) {
							return {
								output: `cat: ${filename}: No such file or directory\n\nUse "ls" to see available files`
							};
						}
						content = await response.text();
					}

					// If it's a markdown file, parse it to HTML and sanitize
					if (filename.endsWith('.md')) {
						const { marked } = await import('marked');
						const DOMPurify = await import('isomorphic-dompurify');
						const rawHtml = await marked(content);
						const sanitizedHtml = DOMPurify.sanitize(rawHtml);
						return { output: sanitizedHtml, isHtml: true };
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
