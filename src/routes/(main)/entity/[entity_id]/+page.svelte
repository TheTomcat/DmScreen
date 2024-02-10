<script lang="ts">
	import * as zs from '$lib/zodschema';
	import { onMount } from 'svelte';

	import type { Entity } from '../../../../app.js';

	import client from '$lib/api/index';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Statblock from '$lib/components/new/EntityEditor/Statblock.svelte';

	let entity_id: number = parseInt($page.params.entity_id);
	let entity: Entity;
	let output: ReturnType<typeof zs.creatureSchema.safeParse>;

	$: {
		if (browser) {
			client.GET('/entity/{entity_id}', { params: { path: { entity_id } } }).then((response) => {
				if (!response || !response.data) return;
				entity = response.data;
			});
		}
	}

	$: {
		if (entity && entity.data && entity.data != '{}')
			output = zs.creatureSchema.safeParse(JSON.parse(entity.data));
	}
</script>

<Statblock {entity} />
<!-- 
{JSON.stringify(output)}
<div>
	{#if output && !output.success && output.error && output.error}
		<h2>Errors:</h2>
		{#each output.error['issues'] as error}
			{JSON.stringify(error)}
		{/each}
	{/if}
</div> -->
