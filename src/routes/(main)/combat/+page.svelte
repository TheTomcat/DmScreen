<script lang="ts">
	import { onMount } from 'svelte';
	import type { Combat } from '../../../app';
	import { apiGetAllCombats } from '$lib/api';

	let allCombats: Combat[] = [];
	onMount(() => {
		apiGetAllCombats(fetch).then((combats) => {
			allCombats = combats;
		});
	});
</script>

{#each allCombats as combat}
	<a href={`/combat/${combat.combat_id}`}>{combat.combat_id} - {combat.title} </a><br />
{/each}
