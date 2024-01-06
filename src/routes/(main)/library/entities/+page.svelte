<script lang="ts">
	import client from '$lib/api/index';
	import Dialog from '$lib/components/Dialog.svelte';
	import type { Entity, Participant } from '../../../../app';
	// import EntityEdit from '$lib/components/new/EntityDisplay.svelte';
	// import EntityDisplay from '$lib/components/new/EntityDisplay.svelte';
	import Statblock from '$lib/components/new/EntityDisplay/Statblock.svelte';
	import { entityHasData } from '$lib/jsonschema';

	let entityDialog: Dialog;
	let currentEntity: Entity;
	let lastPage: number = 1;
	let entities: Entity[] = [];

	let participant: Participant = { participant_id: 1, combat_id: 1 } as Participant;

	const getEntities = async (getPage: number) => {
		return client.GET('/entity/', { params: { query: { page: getPage } } }).then((response) => {
			if (!response || !response.data) return;
			entities = [
				...entities,
				...response.data.items.map((e) => {
					return { ...e, data: JSON.parse(e.data || '{}') };
				})
			];
			return response.data;
		});
	};
</script>

{#await getEntities(1) then data}
	<!-- {#if data} -->
	{#each entities as entity}
		<button
			on:click={() => {
				if (!entityHasData(entity)) return;
				currentEntity = entity;
				console.log(entity);
				entityDialog.open();
			}}>{entity.name}</button
		>
	{/each}
	{#if (data?.pages || 1) > (data?.page || 1)}
		<button
			on:click={() => {
				lastPage += 1;
				getEntities(lastPage);
			}}>Get More</button
		>
	{/if}
	<!-- {:else} -->
	<!-- No entities -->
	<!-- {/if} -->
{/await}

<Dialog mode="mega" bind:this={entityDialog}>
	<!-- {#if currentEntity} -->
	<Statblock slot="content" bind:entity={currentEntity} {participant} />
	<!-- {/if} -->
</Dialog>
