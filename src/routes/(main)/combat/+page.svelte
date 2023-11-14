<script lang="ts">
	import { onMount } from 'svelte';
	import type { Combat } from '../../../app';
	// import { apiGetAllCombats } from '$lib/api';
	import client from '$lib/api/index';

	let allCombats: Awaited<ReturnType<typeof getCombats>> | undefined;

	const getCombats = async () => {
		return client.GET('/combat/');
	};

	onMount(() => {
		getCombats().then((combats) => {
			allCombats = combats; //?.data?.items
			console.log(combats);
		});
		// apiGetAllCombats(fetch).then((combats) => {
		// 	allCombats = combats;
		// });
	});
</script>

<h1>Combats</h1>

<table>
	<thead>
		<th>id</th>
		<th>Name</th>
		<th>Edit</th>
		<th>Run</th>
	</thead>
	<tbody>
		{#if allCombats?.data?.items}
			{#each allCombats?.data?.items as combat}
				<a href={`/combat/${combat.combat_id}`}>{combat.combat_id} - {combat.title} </a><br />
			{/each}
		{/if}
	</tbody>
</table>
<!-- {#each allCombats as combat}
	<a href={`/combat/${combat.combat_id}`}>{combat.combat_id} - {combat.title} </a><br />
{/each} -->
