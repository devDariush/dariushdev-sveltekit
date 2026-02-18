import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { readdirSync } from 'fs';
import { join } from 'path';
import type { Plugin } from 'vite';

/**
 * Vite plugin that reads the static/ directory at build time and provides
 * a virtual module with the file list. This avoids runtime filesystem access
 * which is not available on Cloudflare Workers.
 */
function staticFilesPlugin(): Plugin {
	const virtualModuleId = 'virtual:static-files';
	const resolvedVirtualModuleId = '\0' + virtualModuleId;

	return {
		name: 'static-files',
		resolveId(id) {
			if (id === virtualModuleId) return resolvedVirtualModuleId;
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				const staticDir = join(process.cwd(), 'static');
				try {
					const HIDDEN_FILES = new Set(['sitemap.xml', 'robots.txt']);
					const entries = readdirSync(staticDir, { withFileTypes: true });
					const files = entries
						.filter(
							(entry) =>
								entry.isFile() && !entry.name.startsWith('.') && !HIDDEN_FILES.has(entry.name)
						)
						.map((entry) => entry.name)
						.sort();
					return `export const staticFiles = ${JSON.stringify(files)};`;
				} catch {
					return `export const staticFiles = [];`;
				}
			}
		}
	};
}

export default defineConfig({
	plugins: [tailwindcss(), staticFilesPlugin(), sveltekit()],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'edge-runtime',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
