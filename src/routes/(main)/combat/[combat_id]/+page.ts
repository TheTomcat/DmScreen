import type { Load } from '@sveltejs/kit';
import client from '$lib/api/index';
// import {paths, components} from '$lib/api/v1'

/** @type {import('./$types').PageLoad} */
export const load: Load = async ({ params, fetch }) => {
    const image = await client.GET(`/combat/{combat_id}`, {
        params: { path: { combat_id: parseInt(params.combat_id || "1") } },
        fetch
    });

    return image

}
