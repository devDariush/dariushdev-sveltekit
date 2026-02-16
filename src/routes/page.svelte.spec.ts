import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render terminal with greeting', async () => {
		render(Page, {
			props: {
				data: {
					history: [
						{
							type: 'greeting',
							content: 'WELCOME'
						}
					],
					darkMode: false,
					greeting: 'WELCOME'
				}
			}
		});

		// Check that the greeting is rendered
		await expect.element(page.getByText('WELCOME')).toBeInTheDocument();
	});
});
