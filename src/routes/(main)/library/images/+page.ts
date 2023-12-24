// import { apiGetAllMessages } from "$lib/api"
import type { Load } from '@sveltejs/kit';
import client from '$lib/api/index';

/** @type {import('./$types').PageLoad} */
export const load: Load = async ({ url, fetch }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const size = Number(url.searchParams.get('size')) || 20;


    const params = {
        query: { page, size }
    }
    const messages = await client.GET(`/image/`, { params, fetch });

    return {

        data: messages.data,
        error: messages.error

    }
}