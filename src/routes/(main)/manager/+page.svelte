<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import type { components } from '$lib/api/v1';
	import ImageManager from '$lib/components/new/ImageManager.svelte';
	import { goto } from '$app/navigation';

	export let data;

	type Image = components['schemas']['ImageURL'];

	const imageTypes = ['backdrop', 'character', 'handout', 'map'] as const;

	let image: Image | null;
	let state: 'loading' | 'error' | 'done' = 'done';
	let searchInput: HTMLInputElement;

	const searchParams = new URLSearchParams('image=1');
	let image_id: number = 1;
	$: image_id = parseInt($page.url.searchParams.get('image')?.toString() || '1');

	onMount(() => {
		if (data.error || !data.data) {
			state = 'error';
			return;
		}
		image_id = data.data.image_id;
		image = data.data;
		state = 'done';
	});

	const go = () => {
		goto(`?${searchParams.toString()}`, { replaceState: true }).then(() => {
			if (data.data) {
				image = data.data;
				state = 'done';
				searchInput.focus();
			}
		});
	};

	const next = () => {
		searchParams.set('image', (image_id + 1).toString());
		state = 'loading';
		go();
	};
	const prev = () => {
		if (image_id == 1) return;
		searchParams.set('image', (image_id - 1).toString());
		state = 'loading';
		go();
	};
</script>

<div class="container">
	{#if state == 'error'}
		<div class="error">An unexpected error occurred.</div>
	{:else if image}
		<ImageManager {image} on:emptysubmit={next} bind:searchInput />
		<div class="nav">
			<button on:click={prev} disabled={image_id === 1}>Previous</button><button on:click={next}
				>Next</button
			>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: auto;
		padding: var(--size-3);
	}
	.nav {
		grid-area: nav;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.nav button {
		width: var(--size-12);
		background-color: var(--surface-4);
		padding: var(--size-3);
	}
</style>
