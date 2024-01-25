<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	import client from '$lib/api/index';
	import type { ImageURL } from '../../app';
	import { browser } from '$app/environment';
	import { playerStateStore, type wsImageData, type playerState } from '$lib/ws';

	const dispatch = createEventDispatcher<{
		changing: { prev_image_id: number | undefined; next_image_id: number };
		changed: { image_id: number };
	}>();

	// export let image_id: number | undefined = undefined;
	// export let imageData: wsImageData | undefined = undefined;
	// export let cycleImage: boolean = false;
	// export let cycleImageTimeout: number = 30000;

	// export let current_image_id: number | undefined = -1;
	let previous_image_id: number | undefined = -1;
	let previous_image_data: wsImageData | undefined = undefined;
	let imageData: ImageURL | undefined;

	let imageBox: HTMLDivElement;
	let is_transitioning: boolean = false;

	let timeoutID: number | undefined;

	onDestroy(() => {
		clearTimeout(timeoutID);
	});

	$: {
		$playerStateStore.background_image_data; //If the data changes
		if (browser) {
			if ($playerStateStore.background_image_data != previous_image_data) {
				// And the data is not the same as the old data
				// Find out what image we should display

				fetchImageDataAndDisplayImage(); // Get an image
			}
		}
	}

	$: {
		if (!$playerStateStore.background_image_cycle) {
			console.log('clearing');
			clearTimeout(timeoutID);
			timeoutID = undefined;
		} else if ($playerStateStore.background_image_cycle && !timeoutID) {
			console.log('scheduling');
			schedulePageUpdate($playerStateStore.background_image_timeout);
		}
	}

	const schedulePageUpdate = (timer = -1) => {
		if (timer == -1) timer = $playerStateStore.background_image_timeout;
		timeoutID = setTimeout(() => {
			fetchImageDataAndDisplayImage();
			schedulePageUpdate(timer);
		}, timer);
	};

	const _chooseNextImage = (): number | undefined => {
		let d = $playerStateStore.background_image_data;
		if (!d) {
			return undefined;
		} else if (typeof d == 'number') {
			return d;
		} else if (Array.isArray(d) && typeof d[0] == 'number') {
			return d[Math.floor(Math.random() * d.length)];
		} else if ('collection_id' in d) {
			return d.images[Math.floor(Math.random() * d.images.length)].image_id;
		} else if ('image_id' in d) {
			return d.image_id;
		}
		return undefined; // random
	};

	const chooseNextImage = () => {
		playerStateStore.update((state) => {
			return { ...state, background_image_id: _chooseNextImage() };
		});
	};

	const fetchImageDataAndDisplayImage = () => {
		chooseNextImage();
		if (previous_image_id == $playerStateStore.background_image_id) return;
		getImageData($playerStateStore.background_image_id).then((response) => {
			console.log(
				`Fetching image data: <Image ${response.data?.image_id}>: ${
					response.data ? 'got!' : `fail: ${response.error}`
				}`
			);
			if (response.data) {
				imageData = response.data;
				dispatch('changing', {
					prev_image_id: previous_image_id,
					next_image_id: response.data.image_id
				});
				previous_image_id = $playerStateStore.background_image_id;
				previous_image_data = $playerStateStore.background_image_data;
				preloadImage(imageData.url, (e: Event) => {
					is_transitioning = true;
					setTimeout(() => {
						if (imageData && imageBox) {
							dispatch('changed', { image_id: response.data.image_id });
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
