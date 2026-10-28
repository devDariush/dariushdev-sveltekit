import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command:
			'npm run build && npx wrangler dev --local --ip 127.0.0.1 --port 4173 --log-level error',
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
