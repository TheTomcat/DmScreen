<script lang="ts">
	import { browser } from '$app/environment';
	import client from '$lib/api/index';

	import { playerStateStore } from '$lib/ws';

	let imageBox: HTMLImageElement;

	$: {
		if (browser) {
			fetchImageDataAndDisplayImage($playerStateStore.handout_image_id);
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
</script>

<img bind:this={imageBox} alt="Loading Handout..." />

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
