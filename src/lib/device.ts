/**
 * Returns true on devices likely to show an on-screen keyboard:
 * coarse primary pointer (touch) combined with a narrow viewport.
 * This intentionally excludes large touch-enabled desktops/tablets that
 * don't pop up a software keyboard on focus.
 */
export function hasOnScreenKeyboard(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(pointer: coarse)').matches &&
		window.matchMedia('(max-width: 1024px)').matches
	);
}
