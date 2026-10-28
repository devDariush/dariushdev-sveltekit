// Cloudflare bindings used by the SvelteKit server routes.
declare global {
	namespace Cloudflare {
		interface Env {
			TERMINAL_KV?: KVNamespace;
			ASSETS?: Fetcher;
		}
	}
}

export {};
