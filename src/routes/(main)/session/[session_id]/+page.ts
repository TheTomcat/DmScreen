// import type { Load } from '@sveltejs/kit';
// import client from '$lib/api/index';

// /** @type {import('./$types').PageLoad} */
// export const load: Load = async ({ params, fetch }) => {
//     const session_id = Number(params.session_id);

//     const session = await client.GET(`/session/{session_id}`, { fetch, params: { path: { session_id } } });

//     return {
//         data: session.data,
//         error: session.error
//     }
// }