<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import Terminal from './Terminal.svelte';
	import TerminalHeader from '$lib/components/TerminalHeader.svelte';
	import TerminalOutput from '$lib/components/TerminalOutput.svelte';
	import type { Link } from '$lib/types/terminal';

	let { data }: { data: PageData } = $props();

	let terminalBodyRef: HTMLDivElement | undefined = $state();
	let inputElement: HTMLInputElement | undefined = $state();

	function updateTheme() {
		if (data.darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function toggleTheme() {
		const themeForm = document.getElementById('theme-form') as HTMLFormElement;
		themeForm?.requestSubmit();
	}

	function handleLinkClick(link: Link) {
		if (link.type === 'url') {
			window.open(link.target, '_blank', 'noopener,noreferrer');
		} else if (link.type === 'command') {
			// For command links with JS, we can execute directly without form submission
			const commandInput = inputElement;
			if (commandInput) {
				commandInput.value = link.target;
				const form = commandInput.closest('form') as HTMLFormElement;
				form?.requestSubmit();
			}
		}

		setTimeout(() => inputElement?.focus(), 0);
	}

	function focusInput() {
		inputElement?.focus();
	}

	function handleFormSubmit() {
		setTimeout(() => {
			if (terminalBodyRef) {
				terminalBodyRef.scrollTop = terminalBodyRef.scrollHeight;
			}
			inputElement?.focus();
		}, 100);
	}

	$effect(() => {
		if (browser) {
			updateTheme();
		}
	});
</script>

<svelte:head>
	<noscript>
		<style>
			.js-only {{ display: none !important; }}
		</style>
	</noscript>
</svelte:head>

{#if browser}
	<!-- Client-side rich terminal with JS -->
	<Terminal initialHistory={data.history} initialDarkMode={data.darkMode} />
{:else}
	<!-- SSR fallback without JS -->
	<div
		class="flex h-screen w-screen flex-col bg-white font-mono text-sm transition-colors dark:bg-gray-900"
		class:dark={data.darkMode}
	>
		<TerminalHeader darkMode={data.darkMode} onToggleTheme={toggleTheme} />

		<form id="theme-form" method="POST" action="?/execute" use:enhance style="display: none;">
			<input type="hidden" name="action" value="toggle-theme" />
		</form>

		<div
			bind:this={terminalBodyRef}
			onclick={focusInput}
			onkeydown={(e) => e.key === 'Enter' && focusInput()}
			role="button"
			tabindex="0"
			class="scrollbar-custom flex-1 cursor-text overflow-y-auto p-5"
		>
			<TerminalOutput history={data.history} onLinkClick={handleLinkClick} />

			<form
				method="POST"
				action="?/execute"
				use:enhance={({ formElement }) => {
					return async ({ update }) => {
						await update();
						formElement.reset();
						handleFormSubmit();
					};
				}}
				class="mt-2 flex items-center gap-2"
			>
				<span class="font-mono font-bold text-green-600 dark:text-green-400">$</span>
				<input
					bind:this={inputElement}
					type="text"
					name="command"
					class="flex-1 border-none bg-transparent font-mono text-gray-900 outline-none dark:text-gray-100"
					spellcheck="false"
					autocomplete="off"
				/>
				<noscript>
					<button
						type="submit"
						class="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
					>
						Run
					</button>
				</noscript>
			</form>
		</div>
	</div>
{/if}
