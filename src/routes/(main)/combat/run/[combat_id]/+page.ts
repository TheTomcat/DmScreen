import type { Load } from '@sveltejs/kit';
import client from '$lib/api/index';

/** @type {import('./$types').PageLoad} */
export const load: Load = async ({ params, fetch }) => {
    const combat_id = Number(params.combat_id);

    const combat = await client.GET(`/combat/{combat_id}`, { fetch, params: { path: { combat_id } } });

    return {
        data: combat.data,
        error: combat.error
    }
}