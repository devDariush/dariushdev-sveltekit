<script lang="ts">
	import type { HistoryEntry, Link } from '$lib/types/terminal';
	import { parseAnsi, hasAnsiCodes } from '$lib/ansi-colors';

	interface Props {
		history: HistoryEntry[];
		onLinkClick?: (link: Link) => void;
	}

	let { history, onLinkClick }: Props = $props();

	function handleLinkClick(link: Link) {
		if (onLinkClick) {
			onLinkClick(link);
		}
	}
</script>

<div class="space-y-1">
	{#each history as entry, i (i)}
		{#if entry.type === 'greeting'}
			<pre
				class="m-0 font-mono leading-tight whitespace-pre text-blue-600 dark:text-blue-400">{entry.content}</pre>
			{#if entry.links && entry.links.length > 0}
				<div class="mt-3 mb-5 flex flex-wrap gap-3 font-mono">
					{#each entry.links as link, k (k)}
						{#if link.type === 'url'}
							<a
								href={link.target}
								target="_blank"
								rel="noopener noreferrer"
								class="rounded border border-blue-500/30 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-500/10 dark:text-blue-400"
							>
								[ {link.text} ]
							</a>
						{:else}
							<form method="POST" action="?/execute" class="inline-block">
								<input type="hidden" name="action" value="link-click" />
								<input type="hidden" name="link-type" value={link.type} />
								<input type="hidden" name="link-target" value={link.target} />
								<button
									type="submit"
									onclick={(e) => {
										if (onLinkClick) {
											e.preventDefault();
											handleLinkClick(link);
										}
									}}
									class="cursor-pointer rounded border border-blue-500/30 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-500/10 dark:text-blue-400"
								>
									[ {link.text} ]
								</button>
							</form>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="mb-5"></div>
			{/if}
		{:else if entry.type === 'command'}
			<div class="font-mono text-green-600 dark:text-green-400">{entry.content}</div>
		{:else}
			<div>
				{#if entry.isHtml}
					<!-- Render HTML content (from markdown) -->
					<div class="markdown-content text-gray-900 dark:text-gray-100">
						{@html entry.content}
					</div>
				{:else if hasAnsiCodes(entry.content)}
					<!-- Render with ANSI color codes -->
					<pre
						class="m-0 font-mono whitespace-pre-wrap text-gray-900 dark:text-gray-100">{#each parseAnsi(entry.content) as segment, j (j)}<span
								class={segment.color || ''}>{segment.text}</span
							>{/each}</pre>
				{:else}
					<!-- Plain text - use blue for greeting-like content, gray for regular output -->
					<pre
						class="m-0 font-mono whitespace-pre-wrap"
						class:text-blue-600={entry.isGreeting}
						class:dark:text-blue-400={entry.isGreeting}
						class:text-gray-900={!entry.isGreeting}
						class:dark:text-gray-100={!entry.isGreeting}>{entry.content}</pre>
				{/if}
				{#if entry.links && entry.links.length > 0}
					<div class="mt-2 space-y-1">
						{#each entry.links as link, k (k)}
							{#if link.type === 'url'}
								<!-- URL links work without JS -->
								<a
									href={link.target}
									target="_blank"
									rel="noopener noreferrer"
									class="block text-left text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
								>
									→ {link.text}
								</a>
							{:else}
								<!-- Command links need forms for NoJS support -->
								<form method="POST" action="?/execute" class="inline-block">
									<input type="hidden" name="action" value="link-click" />
									<input type="hidden" name="link-type" value={link.type} />
									<input type="hidden" name="link-target" value={link.target} />
									<button
										type="submit"
										onclick={(e) => {
											if (onLinkClick) {
												e.preventDefault();
												handleLinkClick(link);
											}
										}}
										class="block cursor-pointer text-left text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										→ {link.text}
									</button>
								</form>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/each}
</div>
