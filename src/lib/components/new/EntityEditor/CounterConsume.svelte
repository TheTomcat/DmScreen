<script lang="ts">
	import { counters, findCounterById, type CounterType, consume } from '$lib/stores/counterStore';

	export let id: string;
	export let qty: number = 1;
	export let label: string;
	let counter: CounterType | undefined;

	$: {
		counter = $counters.find(findCounterById(id));
	}
</script>

<!-- {#if counter} -->
<button
	on:click={() => {
		consume(id, qty);
	}}>{label}</button
>
<!-- {/if} -->
