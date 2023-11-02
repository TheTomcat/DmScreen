import { apiGetAllMessages } from "$lib/api"
import type { Load } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export const load: Load = async ({ params, fetch }) => {
    return {
        messages: await apiGetAllMessages(fetch)
    }
}