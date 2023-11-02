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
	{combat.combat_id} - {combat.title} <br />
{/each}
