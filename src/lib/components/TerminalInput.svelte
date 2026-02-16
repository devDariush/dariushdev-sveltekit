<script lang="ts">
	interface Props {
		value: string;
		onSubmit: () => void;
		onInput: (value: string) => void;
		inputRef?: (el: HTMLInputElement) => void;
	}

	let { value = $bindable(), onSubmit, onInput, inputRef }: Props = $props();
	let cursorRef: HTMLSpanElement | undefined = $state();
	let inputElRef: HTMLInputElement | undefined = $state();

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onSubmit();
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onInput(target.value);
		updateCursorPosition();
	}

	function setRef(el: HTMLInputElement) {
		inputElRef = el;
		if (inputRef) {
			inputRef(el);
		}
	}

	function handleBlur(e: FocusEvent) {
		const target = e.target as HTMLInputElement;
		target?.focus();
	}

	function updateCursorPosition() {
		if (!inputElRef || !cursorRef) return;

		// Create a temporary span to measure text width
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) return;

		const style = window.getComputedStyle(inputElRef);
		context.font = style.font;
		const textWidth = context.measureText(value).width;

		cursorRef.style.left = `${textWidth}px`;
	}

	$effect(() => {
		// Update cursor position whenever value changes
		if (value !== undefined) {
			updateCursorPosition();
		}
	});
</script>

<div class="mt-2 flex items-center gap-2">
	<span class="font-mono font-bold text-green-600 dark:text-green-400">$</span>
	<div class="relative flex-1">
		<input
			use:setRef
			{value}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			onblur={handleBlur}
			type="text"
			class="w-full border-none bg-transparent font-mono text-gray-900 outline-none dark:text-gray-100"
			style="caret-color: transparent;"
			spellcheck="false"
			autocomplete="off"
		/>
		<span
			bind:this={cursorRef}
			class="pointer-events-none absolute top-0 left-0 inline-block h-5 w-2 bg-green-600 dark:bg-green-400"
			style="animation: blink 1s step-end infinite;"
		></span>
	</div>
</div>
