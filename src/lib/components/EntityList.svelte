<script lang="ts">
	import type { Entity } from '../app';
	import EntityRow from './EntityRow.svelte';
	import InputBox from './InputBox.svelte';

	import { PlusSquare } from 'lucide-svelte';

	export let entities: Entity[];
	let entityFilter: string = '';
	let filteredEntities: Entity[];

	$: filteredEntities = entities?.filter((entity) =>
		entity.name.toLowerCase().includes(entityFilter.toLowerCase())
	);
</script>

<div class="entities">
	{#if filteredEntities}
		<div class="header">
			<h4>Add a monster:</h4>
			<InputBox bind:value={entityFilter} placeholder={'Filter...'} />
		</div>
		<div class="entitylist">
			{#each filteredEntities as entity (entity.entity_id)}
				<EntityRow {entity}>
					<button on:click={() => {}}><PlusSquare /></button>
				</EntityRow>
			{/each}
		</div>
	{:else}
		Loading entities...
	{/if}
</div>

<style>
	.header {
		position: sticky;
		top: 0;
		/* background: inherit; */
	}
	.entitylist {
		/* overflow: scroll; */
		padding: var(--size-3);
		max-height: 70vh;
		overflow-y: scroll;
	}
</style>
