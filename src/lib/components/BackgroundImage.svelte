<script lang="ts">
	import { onMount } from 'svelte';

	import client from '$lib/api/index';
	import type { ImageURL } from '../../app';
	import { browser } from '$app/environment';

	export let image_id: number | undefined = undefined;
	export let cycleImage: boolean = false;
	export let cycleImageTimeout: number = 30000;
	let previous_image_id: number | undefined = -1;
	let imageData: ImageURL | undefined;

	let imageBox: HTMLDivElement;
	let is_transitioning: boolean = false;

	$: {
		if (browser) {
			if (image_id != previous_image_id) {
				fetchImageDataAndDisplayImage(image_id);
			}
		}
	}

	const schedulePageUpdate = (timer = cycleImageTimeout) => {
		setTimeout(() => {
			fetchImageDataAndDisplayImage();
			schedulePageUpdate(timer);
		}, timer);
	};
	if (cycleImage) {
		onMount(() => {
			schedulePageUpdate();
		});
	}

	const fetchImageDataAndDisplayImage = (image_id: number | undefined = undefined) => {
		getImageData(image_id).then((response) => {
			console.log(
				`Fetching image data: <Image ${response.data?.image_id}>: ${
					response.data ? 'got!' : `fail: ${response.error}`
				}`
			);
			if (response.data) {
				imageData = response.data;
				previous_image_id = image_id;
				preloadImage(imageData.url, (e: Event) => {
					is_transitioning = true;
					setTimeout(() => {
						if (imageData) {
							imageBox.style.backgroundImage = `url(/api/${imageData.url})`;
							is_transitioning = false;
						}
					}, 750);
				});
			}
		});
	};

	const getImageData = (image_id: number | undefined) => {
		if (image_id) return client.GET('/image/{image_id}', { params: { path: { image_id } } });
		return client.GET('/image/random', { params: { query: { image_type: 'backdrop' } } });
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

	// $: {
	// 	if ($sessionStore.mode && $sessionStore.mode != 'empty') {
	// 		// console.log($sessionStore.backdrop?.url, prevImageURL);
	// 		if ($sessionStore.backdrop?.url != prevImageURL) {
	// 			preloadImage($sessionStore.backdrop?.url, (e: Event) => {
	// 				if ($sessionStore.mode == 'empty') return;
	// 				prevImageURL = $sessionStore.backdrop.url || '';
	// 				is_transitioning = true;
	// 				setTimeout(() => {
	// 					if ($sessionStore.mode != 'empty' && $sessionStore.backdrop?.url) {
	// 						imageBox.style.backgroundImage = `url(/api/${$sessionStore.backdrop.url})`;
	// 						is_transitioning = false;
	// 					}
	// 				}, 750);
	// 			});
	// 		}
	// 	}
	// }

	// https://stackoverflow.com/a/67586908
	// let anim: Animation;
	// onMount(() => {
	// 	anim = imageBox.animate(
	// 		[
	// 			{ transform: `transform: translate3d(-200px, -200px, 0) scale(1.4)` },
	// 			{ transform: `transform: translate3d(0, 0, 0) scale(1.1)` },
	// 			{ transform: `transform: translate3d(400px, -200px, 0) scale(1.5)` }
	// 		],
	// 		{
	// 			duration: 50000,
	// 			easing: 'ease-in-out',
	// 			iterations: Infinity
	// 		}
	// 	);
	// });

	// and later
	//	anim.pause();
</script>

<div bind:this={imageBox} id="image" class:transitioning={is_transitioning} />

<style>
	#image {
		height: 100%;
		width: 100%;

		-webkit-background-size: cover;
		-moz-background-size: cover;
		-o-background-size: cover;
		background-size: cover;
		transform: scale(1.3);
		-webkit-animation: slowpan 50s ease-in-out 0s infinite alternate;
		animation: slowpan 50s ease-in-out 0s infinite alternate;
		position: fixed;
		opacity: 1;
		transition: opacity 1s ease-in-out;
	}

	#image.transitioning {
		opacity: 0;
		transition: opacity 1s ease-in-out;
	}
	@keyframes slowpan {
		0% {
			transform: translate3d(-200px, -200px, 0) scale(1.4);
		}

		50% {
			transform: translate3d(0, 0, 0) scale(1.1);
		}

		100% {
			transform: translate3d(400px, -200px, 0) scale(1.6);
		}
	}
</style>
