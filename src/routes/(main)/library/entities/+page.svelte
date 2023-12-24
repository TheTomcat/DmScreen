<script lang="ts">
	import client from '$lib/api/index';
	import Dialog from '$lib/components/Dialog.svelte';
	import type { Entity } from '../../../../app';
	// import EntityEdit from '$lib/components/new/EntityDisplay.svelte';
	import EntityDisplay from '$lib/components/new/EntityDisplay.svelte';

	let entityDialog: Dialog;
	let currentEntity: Entity;

	const getEntities = async () => {
		return client.GET('/entity/').then((response) => {
			if (!response) return;
			return response.data;
		});
	};
</script>

{#await getEntities() then data}
	{#if data}
		{#each data.items as entity}
			<button
				on:click={() => {
					currentEntity = entity;
					entityDialog.open();
				}}>{entity.name}</button
			>
		{/each}
	{:else}
		No entities
	{/if}
{/await}

<Dialog mode="mega" bind:this={entityDialog}>
	<EntityDisplay slot="content" bind:entity={currentEntity} />
</Dialog>
