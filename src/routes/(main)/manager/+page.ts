// import { apiGetAllMessages } from "$lib/api"
import type { Load } from '@sveltejs/kit';
import client from '$lib/api/index';

/** @type {import('./$types').PageLoad} */
export const load: Load = async ({ url, fetch }) => {
    const image_id = Number(url.searchParams.get('image')) || 1;
    const params = {
        path: {
            image_id
        }
    }
    console.log(`loading ${image_id} from server`)
    const image = await client.GET(`/image/{image_id}`, { params, fetch });

    return image

}