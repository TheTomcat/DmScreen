<script lang="ts">
	import { onMount } from 'svelte';
	import type { Entity } from '../../../../app.js';

	export let data;
	let entity: Partial<Entity>;
	let createNew: boolean = false;

	onMount(() => {
		console.log(entity);
		if (data.entity) {
			createNew = false;
			entity = data.entity;
		} else {
			createNew = true;
			entity = {
				name: '',
				cr: '',
				ac: 10,
				hit_dice: '',
				initiative_modifier: 0,
				is_PC: false
			};
		}
	});

	$: {
		if (entity && entity.is_PC) {
			entity.source = undefined;
			entity.source_page = undefined;
		}
	}

	const onSubmit = () => {
		if (createNew) {
			// apiCreateNewEntity(fetch, entity);
			// let newEntity = {
			// 	// name: name,
			// 	// cr: cr,
			// };
			console.log('Creating new entity:', entity);
			return;
		}
		console.log('Modifying entity', entity);
	};
</script>

<!-- <Modal bind:showModal={dialogVisible} bind:dialog allowCasualDismiss={false}> -->
<h2>Modify Entity</h2>
{#if entity}
	<div class="grid">
		<div>Name</div>
		<input bind:value={entity.name} />
		<div>CR</div>
		<input bind:value={entity.cr} />
		<div>AC</div>
		<input bind:value={entity.ac} />
		<div>Hit dice</div>
		<input bind:value={entity.hit_dice} />
		<div>Initiative modifier</div>
		<input bind:value={entity.initiative_modifier} />
		<div>Player Character</div>
		<input type="checkbox" bind:checked={entity.is_PC} />
		<div>Image ID</div>
		<input bind:value={entity.image_id} />
		<div>Source</div>
		<input
			bind:value={entity.source}
			disabled={entity.is_PC}
			placeholder={entity.is_PC ? 'Invalid for PCs' : ''}
		/>
		<div>Source page</div>
		<input
			bind:value={entity.source_page}
			disabled={entity.is_PC}
			placeholder={entity.is_PC ? 'Invalid for PCs' : ''}
		/>
	</div>
	<button on:click={onSubmit}>Submit</button>
{:else}
	Loading...
{/if}

<!-- </Modal> -->

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--size-3);
	}
</style>
