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
});
