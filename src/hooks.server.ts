import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html.replace('old', 'new'),
        filterSerializedResponseHeaders: (name) => name.startsWith('x-') || name == "content-length" || name == 'content-type',
        preload: ({ type, path }) => type === 'js' || path.includes('/important/'),
    });

    return response;
};