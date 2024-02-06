<script lang="ts">
	import { browser } from '$app/environment';
	import client from '$lib/api/index';

	import { playerStateStore, type MapData } from '$lib/ws';
	import type { Image } from '../../../app';

	let imageBox: HTMLImageElement;
	let image: Image | undefined = undefined;

	$: {
		if (browser) {
			fetchImageDataAndDisplayImage($playerStateStore.map_image_id);
		}
	}

	const fetchImageDataAndDisplayImage = (image_id: number | undefined = undefined) => {
		if (!image_id) return;
		client.GET('/image/{image_id}', { params: { path: { image_id } } }).then((response) => {
			if (response && response.data && imageBox) {
				image = response.data;
				preloadImage(response.data.url, () => {
					imageBox.src = `/api/${response.data.url}`;
					animate($playerStateStore.map_data, image);
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

	// https://stackoverflow.com/a/67586908
	// let anim: Animation;
	// let x = 0;
	const animate = (m: MapData | undefined, image: Image | undefined) => {
		if (!m || !image) return;
		let fx = m.x;
		let fy = m.y;
		// let dx = image.dimension_x;
		// let dy = image.dimension_y;
		// let scale = 1 / (2 * Math.min(fx / dx, fy / dy, (dx - fx) / dx, (dy - fy) / dy));

		let px = imageBox.width * (0.5 - fx) * m.scale;
		let py = imageBox.height * (0.5 - fy) * m.scale;
		console.log(px, py);
		// x += 10;
		let animation = imageBox.animate(
			[{ transform: `translate3d(${px}px,${py}px,0) scale(${m.scale})` }],
			{
				duration: m.transition,
				easing: 'ease-in-out',
				iterations: 1,
				fill: 'forwards'
			}
		);
		return animation;
	};

	$: {
		animate($playerStateStore.map_data, image);
	}
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
