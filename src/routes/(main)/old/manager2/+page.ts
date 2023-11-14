import { apiGetAllTags } from "$lib/api"
import type { Load } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export const load: Load = async ({ params, fetch }) => {
    return {
        tags: await apiGetAllTags(fetch)
    }
}