<script lang="ts">
	import { onMount } from 'svelte';
	import { isValid } from 'zod';

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let t: number, l: number;
	let WIDTH: number, HEIGHT: number;

	let state: 'idle' | 'scaling' = 'idle';

	type Vec2 = { x: number; y: number };
	type Offset2 = { offsetX: number; offsetY: number };
	let start: Vec2 | undefined;
	let end: Vec2 | undefined;

	let isCanvasValid: boolean = true;

	onMount(() => {
		let tContext = canvas.getContext('2d');
		if (!tContext) return;
		context = tContext;
		context.lineWidth = 3;

		handleSize();
	});

	const handleSize = () => {
		const { top, left } = canvas.getBoundingClientRect();
		t = top;
		l = left;
		WIDTH = canvas.width;
		HEIGHT = canvas.height;
	};

	const handleStart = ({ offsetX: x, offsetY: y }: Offset2) => {
		if (state == 'idle') {
			state = 'scaling';
			start = { x, y };
		}
		// console.log('click', x, y);
	};

	const handleEnd = () => {
		state = 'idle';
	};
	const handleMove = ({ offsetX: x1, offsetY: y1 }: Offset2) => {
		if (state == 'idle') return;
		if (!start) return;
		context.strokeStyle = '#fff';
		// context.reset();
		let end: Vec2 = { x: x1 - start.x, y: y1 - start.y };
		drawSelection(context, start, { x: x1 - start.x, y: y1 - start.y });
		// context.beginPath()
		// context.moveTo(x, y)
		// context.lineTo(x1, y1)
		// context.closePath()
		// context.stroke()
	};

	const drawSelection = (context: CanvasRenderingContext2D, P: Vec2, Q: Vec2) => {
		context.fillStyle = '';
		context.strokeStyle = '';
		context.lineWidth = 2;
		context.fillRect(P.x, P.y, Q.x, Q.y);
	};

	const invalidate = () => {
		isCanvasValid = false;
	};

	const clear = (c: CanvasRenderingContext2D) => {
		c.clearRect(0, 0, t, l);
	};
	const draw = () => {
		if (isCanvasValid) return;
	}; //https://jsfiddle.net/M8kms/2/
</script>

<svelte:window on:resize={handleSize} />
<canvas
	bind:this={canvas}
	height={300}
	width={300}
	on:mousedown={handleStart}
	on:touchstart={(e) => {
		const { clientX, clientY } = e.touches[0];
		handleStart({
			offsetX: clientX - l,
			offsetY: clientY - t
		});
	}}
	on:mouseup={handleEnd}
	on:touchend={handleEnd}
	on:mouseleave={handleEnd}
	on:mousemove={handleMove}
	on:touchmove={(e) => {
		const { clientX, clientY } = e.touches[0];
		handleMove({
			offsetX: clientX - l,
			offsetY: clientY - t
		});
	}}
/>
