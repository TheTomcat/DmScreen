<script lang="ts">
	import {
		type CounterType,
		counters,
		findCounterById,
		findCounter,
		setCounter
	} from '$lib/stores/counterStore';
	import { Ban } from 'lucide-svelte';

	export let id: string;
	export let abbreviated: boolean = false;
	let counter: CounterType | undefined;

	$: {
		counter = $counters.find(findCounterById(id));
	}

	let remaining: number;
	let used: boolean[];

	$: {
		if (counter) {
			used = Array(counter.total)
				.fill(false)
				.map((el, ind) => {
					return ind < (counter?.total || 3) - (counter?.numConsumed || 0);
				});
			remaining = counter.total - counter.numConsumed;
		}
	}
</script>

{#if counter}
	<span class="counter" style="">
		{#if !abbreviated}
			<span class="title">{counter.title}</span>
			<button on:click|preventDefault={() => setCounter(id, 0)} class="pip cancel"
				><Ban size={16} /></button
			>
		{/if}
		{#each used as pip, i}
			<button
				on:click|preventDefault={() => setCounter(id, i + 1)}
				class="pip circle"
				class:unused={pip}
				name={`remaining${i + 1}`}
			/>
		{/each}
	</span>
{/if}

<style>
	.counter {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: start;
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
