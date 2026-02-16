export interface Link {
	text: string;
	type: 'command' | 'url';
	target: string;
}

export interface CommandConfig {
	description: string;
	response?: string;
	action?: string;
	links?: Link[];
}

export interface TerminalConfig {
	greeting: string;
	greetingLinks?: Link[];
	commands: Record<string, CommandConfig>;
}

export interface HistoryEntry {
	type: 'command' | 'output' | 'greeting';
	content: string;
	links?: Link[];
	isGreeting?: boolean; // Flag to indicate greeting-style output
	isHtml?: boolean; // Flag to indicate content should be rendered as HTML
}
