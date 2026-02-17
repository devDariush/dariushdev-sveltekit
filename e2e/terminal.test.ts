import { expect, test } from '@playwright/test';

test.describe('Terminal E2E Tests', () => {
	test.describe('Core Functionality', () => {
		test('should load terminal and display greeting', async ({ page }) => {
			await page.goto('/');

			// Check terminal greeting is present
			await expect(page.getByText("Type 'help' for commands")).toBeVisible();
			await expect(page.getByText('Dariush Komeili')).toBeVisible();
		});

		test('should execute ping command and show output', async ({ page }) => {
			await page.goto('/');

			// Wait for terminal to be ready
			await page.waitForLoadState('networkidle');

			// Type ping command
			const input = page.locator('input[type="text"]').first();
			await input.fill('ping');
			await input.press('Enter');

			// Check for command echo and response
			await expect(page.getByText('$ ping')).toBeVisible();
			await expect(page.getByText('pong')).toBeVisible();
		});

		test('should execute help command and list commands', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('help');
			await input.press('Enter');

			// Check for command list
			await expect(page.getByText('Available commands:')).toBeVisible();
			await expect(page.getByText('ping')).toBeVisible();
			await expect(page.getByText('Test connectivity')).toBeVisible();
		});

		test('should execute echo command with arguments', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('echo Hello World');
			await input.press('Enter');

			await expect(page.getByText('$ echo Hello World')).toBeVisible();
			await expect(page.getByText('Hello World', { exact: true })).toBeVisible();
		});

		test('should clear terminal', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Execute a command first
			const input = page.locator('input[type="text"]').first();
			await input.fill('ping');
			await input.press('Enter');
			await expect(page.getByText('pong')).toBeVisible();

			// Clear terminal
			await input.fill('clear');
			await input.press('Enter');

			// Only greeting should be visible (history cleared)
			await expect(page.getByText("Type 'help' for commands")).toBeVisible();
			await expect(page.getByText('pong')).not.toBeVisible();
		});
	});

	test.describe('File Operations', () => {
		test('should list files with ls command', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('ls');
			await input.press('Enter');

			// Check for file list
			await expect(page.getByText('about.md')).toBeVisible();
			await expect(page.getByText('docs.md')).toBeVisible();
		});

		test('should read file with cat command', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('cat about.md');
			await input.press('Enter');

			// Check for file content (markdown rendered)
			await expect(page.getByText('Dariush Komeili')).toBeVisible();
			await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
		});

		test('should show usage when cat without filename', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('cat');
			await input.press('Enter');

			await expect(page.getByText('Usage: cat <filename>')).toBeVisible();
		});

		test('should show error for nonexistent file', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('cat nonexistent.txt');
			await input.press('Enter');

			await expect(page.getByText('No such file or directory')).toBeVisible();
		});

		test('should render markdown links with target="_blank" and rel="noopener noreferrer"', async ({
			page
		}) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('cat about.md');
			await input.press('Enter');

			// Wait for markdown content to appear
			await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

			// All links in the rendered markdown output should open in a new tab
			const renderedLinks = page.locator('.markdown-content a');
			const count = await renderedLinks.count();
			expect(count).toBeGreaterThan(0);

			for (let i = 0; i < count; i++) {
				const link = renderedLinks.nth(i);
				await expect(link).toHaveAttribute('target', '_blank');
				await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
			}
		});
	});

	test.describe('Theme Toggle', () => {
		test('should toggle between dark and light mode', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Get initial theme
			const html = page.locator('html');
			const initialClass = (await html.getAttribute('class')) || '';

			// Click theme toggle button
			const themeButton = page.getByRole('button', { name: /theme/i });
			await themeButton.click();
			await page.waitForTimeout(100); // Wait for theme to apply

			// Check theme changed
			const newClass = (await html.getAttribute('class')) || '';
			expect(initialClass).not.toBe(newClass);

			// Toggle back
			await themeButton.click();
			await page.waitForTimeout(100);
			const finalClass = (await html.getAttribute('class')) || '';
			expect(finalClass).toBe(initialClass);
		});
	});

	test.describe('History Persistence', () => {
		test('should persist command history after reload', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Execute commands
			const input = page.locator('input[type="text"]').first();
			await input.fill('ping');
			await input.press('Enter');
			await expect(page.getByText('pong')).toBeVisible();

			await input.fill('echo test persistence');
			await input.press('Enter');
			await expect(page.getByText('test persistence').first()).toBeVisible();

			// Reload page
			await page.reload();
			await page.waitForLoadState('networkidle');

			// Check history persisted
			await expect(page.getByText('$ ping')).toBeVisible();
			await expect(page.getByText('pong')).toBeVisible();
			await expect(page.getByText('$ echo test persistence')).toBeVisible();
			await expect(page.getByText('test persistence').first()).toBeVisible();
		});

		test('should clear history and persist clear state', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Execute some commands
			const input = page.locator('input[type="text"]').first();
			await input.fill('ping');
			await input.press('Enter');
			await expect(page.getByText('pong')).toBeVisible();

			// Clear terminal
			await input.fill('clear');
			await input.press('Enter');

			// Reload
			await page.reload();
			await page.waitForLoadState('networkidle');

			// History should be clear (only greeting visible)
			await expect(page.getByText("Type 'help' for commands")).toBeVisible();
			await expect(page.getByText('pong')).not.toBeVisible();
		});
	});

	test.describe('Progressive Enhancement (No JS)', () => {
		test('should work without JavaScript', async ({ browser }) => {
			// Create new context with JS disabled
			const context = await browser.newContext({ javaScriptEnabled: false });
			const page = await context.newPage();

			await page.goto('/');

			// Check terminal elements are present
			await expect(page.getByText("Type 'help' for commands")).toBeVisible();
			// Terminal is rendered but interactive features require JS
			const input = page.locator('input[type="text"]').first();
			await expect(input).toBeVisible();

			await context.close();
		});

		// Note: Form submission without JS uses SvelteKit's SSR fallback branch which
		// is only rendered in true server-side scenarios (e.g., curl, search engines).
		// Playwright's JS disabling still renders the client bundle initially, so this
		// test scenario doesn't accurately reflect the SSR-only path. The SSR fallback
		// with <noscript> submit button is implemented in +page.svelte but can't be
		// tested with Playwright's javaScriptEnabled: false approach.
	});

	test.describe('ANSI Colors', () => {
		test('should display colors command with colored output', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('colors');
			await input.press('Enter');

			// Check for color output (text content should be visible)
			await expect(page.getByText('Red text')).toBeVisible();
			await expect(page.getByText('Green text')).toBeVisible();
			await expect(page.getByText('Blue text')).toBeVisible();

			// Check that colored elements have color classes
			const redText = page.getByText('Red text');
			const classes = await redText.getAttribute('class');
			expect(classes).toContain('text-red');
		});
	});

	test.describe('Input Focus', () => {
		test('should auto-focus input after command execution', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();

			// Execute command
			await input.fill('ping');
			await input.press('Enter');
			await expect(page.getByText('pong')).toBeVisible();

			// Input should still be focused
			await expect(input).toBeFocused();
		});
	});

	test.describe('Error Handling', () => {
		test('should show error for unknown command', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			await input.fill('unknowncommand');
			await input.press('Enter');

			await expect(page.getByText('Command not found: unknowncommand')).toBeVisible();
		});

		test('should handle empty command gracefully', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();

			// Fill with empty string and press Enter
			await input.fill('');
			await input.press('Enter');

			// Check that no command prompt was added (only the welcome message exists)
			const commandPrompts = await page.locator('.text-green-600').count();
			expect(commandPrompts).toBeLessThanOrEqual(1); // Should be 0 or 1 (only if previous tests ran)
		});
	});

	test.describe('Greeting Link Buttons', () => {
		// Regression test for: focus() without preventScroll caused the scroll container
		// to jump when input re-focused during the mousedown/mouseup click sequence.
		// This moved the greeting button out from under the cursor before the click event
		// fired, silently dropping the command. Consistently reproduced on the 3rd button
		// click after enough output had accumulated to cause overflow.
		// Fix: use focus({ preventScroll: true }) in the blur handler and related focus calls.
		test('should remain clickable after multiple commands cause content overflow', async ({
			page
		}) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input[type="text"]').first();
			const terminalBody = page.locator(
				'[aria-label="Terminal output area, click or press Enter to focus input"]'
			);

			// Run several commands that produce substantial output so the terminal
			// container overflows — this is the precondition that triggered the bug.
			await input.fill('help');
			await input.press('Enter');
			await expect(page.getByText('Available commands:')).toBeVisible();

			await input.fill('colors');
			await input.press('Enter');
			await expect(page.getByText('Red text')).toBeVisible();

			await input.fill('ping');
			await input.press('Enter');
			await expect(page.getByText('pong').last()).toBeVisible();

			// Scroll to the top so the greeting buttons are in view.
			await terminalBody.evaluate((el) => {
				el.scrollTop = 0;
			});

			// Click '[ about ]' — first button, verifies baseline works.
			await page.getByRole('button', { name: '[ about ]' }).click();
			await expect(page.getByRole('heading', { name: 'Dariush Komeili' }).last()).toBeVisible();

			// Scroll back to top to access the greeting buttons again.
			await terminalBody.evaluate((el) => {
				el.scrollTop = 0;
			});

			// Click '[ contact ]' — second button.
			await page.getByRole('button', { name: '[ contact ]' }).click();
			await expect(page.getByRole('heading', { name: 'Contact' }).last()).toBeVisible();

			// Scroll back to top once more.
			await terminalBody.evaluate((el) => {
				el.scrollTop = 0;
			});

			// Click '[ social ]' — third button. This was the one that silently failed
			// before the preventScroll fix because the container had enough overflow
			// content by this point to shift layout on focus().
			await page.getByRole('button', { name: '[ social ]' }).click();
			await expect(page.getByRole('heading', { name: 'Social Links' }).last()).toBeVisible();
		});
	});
});
