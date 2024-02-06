<script lang="ts">
	import { browser } from '$app/environment';
	import client from '$lib/api/index';

	import { playerStateStore, type MapData } from '$lib/ws';
	import { createEventDispatcher } from 'svelte';
	import type { Image } from '../../../app';

	import { Slider } from '$lib/components/ui/slider';
	let scale: number[] = [1];
	let minScale: 1;
	let maxScale: 10;

	let x: number;
	let y: number;

	const dispatch = createEventDispatcher<{
		click: Omit<MapData, 'transition'>;
	}>();

	let imageBox: HTMLImageElement;

	$: {
		if (browser) {
			fetchImageDataAndDisplayImage($playerStateStore.map_image_id);
		}
	}

	const fetchImageDataAndDisplayImage = (image_id: number | undefined = undefined) => {
		if (!image_id) return;
		client.GET('/image/{image_id}', { params: { path: { image_id } } }).then((response) => {
			if (response && response.data && imageBox) {
				preloadImage(response.data.url, () => {
					imageBox.src = `/api/${response.data.url}`;
				});
			}
		});
	};

	const preloadImage = (
		imageURL: string | undefined,
		onload: (this: HTMLImageElement, ev: Event) => any
	) => {
		if (!imageURL) return;
		let newImageObject = new Image();
		newImageObject.src = `/api/${imageURL}`;
		newImageObject.addEventListener('load', onload);
	};

	const handleClick = (e: MouseEvent) => {
		x = (e.x - imageBox.x) / imageBox.width;
		y = (e.y - imageBox.y) / imageBox.height;
		let minRatio = 2 * Math.min(x, y, 1 - x, 1 - y);
		scale[0] = 1 / minRatio;
		if (e.ctrlKey) scale[0] *= 2;
		if (e.altKey) scale[0] *= 4;
		dispatch('click', {
			x,
			y,
			scale: scale[0]
		});
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- <Slider
	bind:value={scale}
	max={maxScale}
	min={minScale}
	step={0.1}
	class="max-w-[70%]"
	onValueChange={() => {
		console.log(scale);
		// dispatch('click', { x, y, scale: scale[0] });
	}}
/> -->
<img bind:this={imageBox} alt="Loading Handout..." on:click={handleClick} />

<style>
	img {
		object-fit: contain;
		margin: auto;
		/* mix-blend-mode: multiply; */
		/* background-color: white; */

		overflow: hidden;
		height: 100%;
		border: 1px solid var(--gray-6);
		box-shadow: var(--shadow-5);
	}
</style>
