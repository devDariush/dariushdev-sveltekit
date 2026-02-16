<script lang="ts">
	import { onMount } from 'svelte';
	import TerminalHeader from '$lib/components/TerminalHeader.svelte';
	import TerminalOutput from '$lib/components/TerminalOutput.svelte';
	import TerminalInput from '$lib/components/TerminalInput.svelte';
	import { executeCommand, config } from '$lib/commands-utils';
	import type { HistoryEntry, Link } from '$lib/types/terminal';

	interface Props {
		initialHistory?: HistoryEntry[];
		initialDarkMode?: boolean;
	}

	let { initialHistory = [], initialDarkMode = true }: Props = $props();

	let history: HistoryEntry[] = $state([]);
	let input = $state('');
	let terminalBodyRef: HTMLDivElement;
	let inputElement: HTMLInputElement;
	let darkMode = $state(true);

	onMount(() => {
		// Initialize from props
		if (initialHistory.length > 0) {
			history = [...initialHistory];
		} else {
			history.push({ type: 'greeting', content: config.greeting });
		}

		darkMode = initialDarkMode;

		// Apply theme to document
		updateTheme();

		// Focus input
		inputElement?.focus();
	});

	function updateTheme() {
		if (darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function toggleTheme() {
		darkMode = !darkMode;
		updateTheme();
	}

	async function handleSubmit() {
		if (!input.trim()) return;

		history.push({ type: 'command', content: `$ ${input}` });

		const [cmd, ...args] = input.trim().split(/\s+/);
		const command = config.commands[cmd.toLowerCase()];

		if (command?.action === 'clear') {
			// Show greeting immediately, but don't persist it (load function will add it)
			history = [{ type: 'greeting', content: config.greeting }];
			input = '';
			// Save empty history to server
			await saveHistory([]);
			return;
		}

		const result = await executeCommand(cmd, args, { isServer: false });
		if (result.output) {
			history.push({
				type: result.isGreeting ? 'greeting' : 'output',
				content: result.output,
				links: result.links,
				isGreeting: result.isGreeting,
				isHtml: result.isHtml
			});
		}

		input = '';

		// Save history to server (excluding greeting)
		const historyToSave = history.filter((entry) => entry.type !== 'greeting');
		await saveHistory(historyToSave);

		setTimeout(() => {
			if (terminalBodyRef) {
				terminalBodyRef.scrollTop = terminalBodyRef.scrollHeight;
			}
		}, 0);
	}

	async function saveHistory(historyToSave: HistoryEntry[]) {
		try {
			await fetch('?/persist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					history: JSON.stringify(historyToSave)
				})
			});
		} catch (error) {
			console.error('Failed to save history:', error);
		}
	}

	function handleLinkClick(link: Link) {
		if (link.type === 'command') {
			input = link.target;
			handleSubmit();
		} else if (link.type === 'url') {
			window.open(link.target, '_blank', 'noopener,noreferrer');
		}
		setTimeout(() => inputElement?.focus(), 0);
	}

	function handleInput(value: string) {
		input = value;
	}

	function setInputRef(el: HTMLInputElement) {
		inputElement = el;
	}

	function focusInput() {
		inputElement?.focus();
	}
</script>

<div
	class="flex h-screen w-screen flex-col bg-white font-mono text-sm transition-colors dark:bg-gray-900"
>
	<TerminalHeader {darkMode} onToggleTheme={toggleTheme} />

	<div
		bind:this={terminalBodyRef}
		onclick={focusInput}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				focusInput();
			}
		}}
		role="button"
		tabindex="0"
		aria-label="Terminal output area, click or press Enter to focus input"
		class="scrollbar-custom flex-1 cursor-text overflow-y-auto p-5"
	>
		<TerminalOutput {history} onLinkClick={handleLinkClick} />
		<TerminalInput
			bind:value={input}
			onSubmit={handleSubmit}
			onInput={handleInput}
			inputRef={setInputRef}
		/>
	</div>
</div>
