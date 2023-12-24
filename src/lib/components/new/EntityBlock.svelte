<script lang="ts">
	import { PlusCircle, Trash, Trash2 } from 'lucide-svelte';
	import { flip } from 'svelte/animate';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		entity_updated: {};
	}>();

	export let heading: string;
	export let mode: 'block' | 'value' | 'simple';
	type Data = {
		// id: number;
		title: string;
		desc: string | number | undefined;
	};
	export let data: Data[];

	const addRow = () => {
		data = [
			...data,
			{
				// id: Date.now(),
				title: '',
				desc: mode == 'block' ? '' : mode == 'value' ? 0 : undefined
			}
		];
	};
</script>

<div class="container">
	<h5>{heading}</h5>
	<div class="elements">
		{#each data as row, i}
			{#if mode == 'block'}
				<div class="element">
					<div class="heading">
						<input bind:value={data[i].title} />
						<button
							on:click|preventDefault={() => {
								data = data.filter((d) => d.title !== row.title);
							}}
						>
							<Trash2 /> Remove
						</button>
					</div>
					<textarea bind:value={data[i].desc} />
				</div>
			{:else if mode == 'value'}
				<div class="element">
					<div class="value">
						<input bind:value={data[i].title} />
						<input type="number" bind:value={data[i].desc} />
						<button
							on:click|preventDefault={() => {
								data = data.filter((d) => d.title !== row.title);
							}}
						>
							<Trash2 /> Remove
						</button>
					</div>
				</div>
			{:else}
				<div class="element">
					<div class="heading">
						<input bind:value={data[i].title} />
						<button
							on:click|preventDefault={() => {
								data = data.filter((d) => d.title !== row.title);
							}}
						>
							<Trash2 /> Remove
						</button>
					</div>
				</div>
			{/if}
		{/each}
		<button on:click|preventDefault={addRow}><PlusCircle /> Add Row</button>
	</div>
</div>

<style>
	.container {
		width: 100%;
	}
	.elements {
		padding-left: var(--size-3);
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}
	.elements button {
		width: 100%;
	}
	.element {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}
	.value {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}

	.heading {
		display: flex;
		flex-direction: row;
	}
	.heading input {
		width: 80%;
	}
	.heading button {
		width: auto;
	}
</style>
