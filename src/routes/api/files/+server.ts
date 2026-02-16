import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { staticFiles } from 'virtual:static-files';

export const GET: RequestHandler = async () => {
	return json(staticFiles);
};
