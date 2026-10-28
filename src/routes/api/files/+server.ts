import type { RequestHandler } from './$types';
import { staticFiles } from 'virtual:static-files';

export const GET: RequestHandler = async () => {
	return Response.json(staticFiles);
};
