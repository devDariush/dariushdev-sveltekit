import { describe, expect, it } from 'vitest';
import { sanitizeTerminalHtml } from './terminal-html';

describe('terminal HTML', () => {
	it('removes scripts and event handlers from persisted output', () => {
		const html = sanitizeTerminalHtml(
			'<h1>About</h1><script>alert(1)</script><img src="/profile.webp" onerror="alert(1)">'
		);
		expect(html).toContain('<h1>About</h1>');
		expect(html).toContain('src="/profile.webp"');
		expect(html).not.toMatch(/script|onerror|alert/);
	});

	it('rejects executable and protocol-relative links', () => {
		const html = sanitizeTerminalHtml(
			'<a href="javascript:alert(1)">bad</a><img src="//example.org/pixel">'
		);
		expect(html).not.toContain('javascript:');
		expect(html).not.toContain('//example.org');
	});

	it('keeps safe Markdown links isolated from the opener', () => {
		const html = sanitizeTerminalHtml('<a href="https://example.org" title="Example">Link</a>');
		expect(html).toContain('href="https://example.org"');
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="external noopener noreferrer"');
	});

	it('keeps the supported Monero wallet link', () => {
		const html = sanitizeTerminalHtml('<a href="monero:monero@dariush.dev">Monero</a>');
		expect(html).toContain('href="monero:monero@dariush.dev"');
	});

	it('keeps command forms usable without allowing external form destinations', () => {
		const html = sanitizeTerminalHtml(
			'<form action="https://example.org" method="GET" class="inline-block"><input name="link-target" value="cat about.md"><button type="submit" class="terminal-cmd-link">About</button></form>'
		);
		expect(html).toContain('action="?/execute"');
		expect(html).toContain('method="POST"');
		expect(html).toContain('type="hidden"');
		expect(html).toContain('value="cat about.md"');
		expect(html).toContain('class="terminal-cmd-link"');
		expect(html).not.toContain('https://example.org');
	});

	it('preserves image sizing while removing arbitrary styles and embedded content', () => {
		const html = sanitizeTerminalHtml(
			'<img src="/profile.webp" style="max-width:100%;max-height:300px;display:block;margin-top:0.5rem;position:fixed"><iframe src="https://example.org"></iframe><svg onload="alert(1)"></svg>'
		);
		expect(html).toContain('max-width:100%');
		expect(html).toContain('max-height:300px');
		expect(html).not.toMatch(/position|iframe|svg|onload/);
	});
});
