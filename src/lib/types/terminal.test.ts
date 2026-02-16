import { describe, it, expect } from 'vitest';
import type { Link, CommandConfig, TerminalConfig, HistoryEntry } from './terminal';

describe('terminal types', () => {
	describe('Link', () => {
		it('should accept command link', () => {
			const link: Link = {
				type: 'command',
				text: 'Test',
				target: 'ping'
			};
			expect(link.type).toBe('command');
		});

		it('should accept url link', () => {
			const link: Link = {
				type: 'url',
				text: 'Google',
				target: 'https://google.com'
			};
			expect(link.type).toBe('url');
		});
	});

	describe('CommandConfig', () => {
		it('should accept static command with response', () => {
			const cmd: CommandConfig = {
				description: 'Test command',
				response: 'Test response'
			};
			expect(cmd.response).toBe('Test response');
		});

		it('should accept dynamic command', () => {
			const cmd: CommandConfig = {
				description: 'Dynamic command',
				response: 'dynamic'
			};
			expect(cmd.response).toBe('dynamic');
		});

		it('should accept command with action', () => {
			const cmd: CommandConfig = {
				description: 'Clear screen',
				action: 'clear'
			};
			expect(cmd.action).toBe('clear');
		});

		it('should accept command with links', () => {
			const cmd: CommandConfig = {
				description: 'Links command',
				links: [
					{ type: 'command', text: 'Ping', target: 'ping' },
					{ type: 'url', text: 'Website', target: 'https://example.com' }
				]
			};
			expect(cmd.links).toHaveLength(2);
		});
	});

	describe('TerminalConfig', () => {
		it('should accept valid terminal config', () => {
			const config: TerminalConfig = {
				greeting: 'Welcome!',
				commands: {
					ping: {
						description: 'Ping command',
						response: 'pong'
					}
				}
			};
			expect(config.greeting).toBe('Welcome!');
			expect(config.commands.ping).toBeDefined();
		});

		it('should accept multiple commands', () => {
			const config: TerminalConfig = {
				greeting: 'Hello',
				commands: {
					ping: { description: 'Ping', response: 'pong' },
					help: { description: 'Help', response: 'dynamic' },
					clear: { description: 'Clear', action: 'clear' }
				}
			};
			expect(Object.keys(config.commands)).toHaveLength(3);
		});
	});

	describe('HistoryEntry', () => {
		it('should accept command entry', () => {
			const entry: HistoryEntry = {
				type: 'command',
				content: '$ ping'
			};
			expect(entry.type).toBe('command');
		});

		it('should accept output entry', () => {
			const entry: HistoryEntry = {
				type: 'output',
				content: 'pong'
			};
			expect(entry.type).toBe('output');
		});

		it('should accept greeting entry', () => {
			const entry: HistoryEntry = {
				type: 'greeting',
				content: 'Welcome!'
			};
			expect(entry.type).toBe('greeting');
		});

		it('should accept entry with links', () => {
			const entry: HistoryEntry = {
				type: 'output',
				content: 'Some output',
				links: [{ type: 'command', text: 'Test', target: 'test' }]
			};
			expect(entry.links).toHaveLength(1);
		});

		it('should accept entry with isGreeting flag', () => {
			const entry: HistoryEntry = {
				type: 'output',
				content: 'Greeting text',
				isGreeting: true
			};
			expect(entry.isGreeting).toBe(true);
		});

		it('should accept entry with isHtml flag', () => {
			const entry: HistoryEntry = {
				type: 'output',
				content: '<p>HTML content</p>',
				isHtml: true
			};
			expect(entry.isHtml).toBe(true);
		});

		it('should accept entry with all optional fields', () => {
			const entry: HistoryEntry = {
				type: 'output',
				content: 'Full entry',
				links: [{ type: 'url', text: 'Link', target: 'https://example.com' }],
				isGreeting: true,
				isHtml: true
			};
			expect(entry.links).toBeDefined();
			expect(entry.isGreeting).toBe(true);
			expect(entry.isHtml).toBe(true);
		});
	});
});
