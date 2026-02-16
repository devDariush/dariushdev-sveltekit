import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async () => {
	try {
		const staticDir = path.join(process.cwd(), 'static');
		const entries = await fs.readdir(staticDir, { withFileTypes: true });

		const files = entries
			.filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
			.map((entry) => entry.name)
			.sort();

		return json(files);
	} catch (error) {
		console.error('Error listing files:', error);
		return json([], { status: 500 });
	}
};
