// // import { apiGetAllMessages } from "$lib/api"
// import type { Load } from '@sveltejs/kit';
// import client from '$lib/api/index';

// /** @type {import('./$types').PageLoad} */
// export const load: Load = async ({ url, fetch }) => {
//     const page = Number(url.searchParams.get('page')) || 1;
//     const size = Number(url.searchParams.get('size')) || 20;
//     const params = {
//         query: { page, size }
//     }
//     const tags = await client.GET(`/tag/`, { params, fetch });

//     return {
//         tags: {
//             data: tags.data,
//             error: tags.error
//         }
//     }
// }