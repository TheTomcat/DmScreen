<script lang="ts">
	import { apiCreateNewEntity } from '$lib/api';
	import type { Entity } from '../app';
	import Modal from './Modal.svelte';

	export let dialogVisible: boolean;
	let boundEntity: Partial<Entity> = {
		name: '',
		cr: '1',
		ac: 10,
		hit_dice: '3d6+3',
		is_PC: true,
		initiative_modifier: 0
	};
	export const editEntity = (entity: Entity | undefined = undefined) => {
		if (!entity) {
			createNew = false;
			dialog.show();
			dialogVisible = true;
			return;
		}
		boundEntity = { ...entity };
		createNew = true;
		dialog.show();
		dialogVisible = true;
	};
	export let createNew: boolean = false;
	let dialog: HTMLDialogElement;

	const onSubmit = () => {
		if (createNew) {
			// apiCreateNewEntity(fetch, entity);
			// let newEntity = {
			// 	// name: name,
			// 	// cr: cr,
			// };
			console.log('Creating new entity:', boundEntity);
			return;
		}
		console.log('Modifying entity', boundEntity);
	};
</script>

<Modal bind:showModal={dialogVisible} bind:dialog allowCasualDismiss={false}>
	<h2 slot="header">Modify Entity</h2>
	<div class="grid">
		<div>Name</div>
		<input bind:value={boundEntity.name} />
		<div>CR</div>
		<input bind:value={boundEntity.cr} />
		<div>AC</div>
		<input bind:value={boundEntity.ac} />
		<div>Hit dice</div>
		<input bind:value={boundEntity.hit_dice} />
		<div>Initiative modifier</div>
		<input bind:value={boundEntity.initiative_modifier} />
		<div>Player Character</div>
		<input type="checkbox" bind:value={boundEntity.is_PC} />
	</div>
	<button on:click={onSubmit}>Submit</button>
</Modal>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}
</style>
