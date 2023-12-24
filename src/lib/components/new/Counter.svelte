<script lang="ts">
	import { Ban } from 'lucide-svelte';

	export let total: number;
	export let numConsumed: number = 0;
	export let title: string;

	let remaining: number;

	let used: boolean[];

	$: {
		used = Array(total)
			.fill(false)
			.map((el, ind) => ind < total - numConsumed);
		remaining = total - numConsumed;
	}

	const setValue = (val: number) => {
		numConsumed = total - val;
	};
</script>

<div class="counter" style="">
	<span class="title">{title}</span>
	<button on:click|preventDefault={() => setValue(0)} class="pip cancel"><Ban size={16} /></button>
	{#each used as pip, i}
		<button
			on:click|preventDefault={() => setValue(i + 1)}
			class="pip circle"
			class:unused={pip}
			name={`remaining${i + 1}`}
		/>
	{/each}
</div>

<style>
	.counter {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	button {
		border: unset;
		background: unset;
		padding: unset;
		margin: unset;
		color: var(--text-2);
	}
	.circle {
		border-radius: 50%;
		border: 1px solid var(--border);
		display: inline-block;

		right: 0;
		border-radius: 50%;
		margin: var(--size-1);
		height: var(--size-3);
		width: var(--size-3);
		transform: scale(1);
		/* background: rgba(255, 177, 66, 1); */
		border: solid 1px var(--text-2);
		box-shadow: var(--shadow-2);
		background-color: unset;
	}
	.unused {
		background-color: var(--text-2);
	}
</style>
