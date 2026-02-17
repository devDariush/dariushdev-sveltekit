import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npx vite preview',
		port: 4173,
		timeout: 120_000,
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe'
	},
	testDir: 'e2e',
	timeout: 30_000,
	use: {
		baseURL: 'http://localhost:4173'
	}
});
