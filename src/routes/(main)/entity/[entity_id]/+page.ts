import { apiGetEntity } from "$lib/api"
import type { Load } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export const load: Load = async ({ params, fetch }) => {
    if (params.entity_id && params.entity_id != "new") {

        return {
            entity: await apiGetEntity(fetch, parseInt(params.entity_id))
        }
    }
}