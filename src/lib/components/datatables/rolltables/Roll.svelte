<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Dices } from 'lucide-svelte';
	import type { RollTable } from '../../../../app';
	import { rollFromTable } from '$lib';
	import { createEventDispatcher } from 'svelte';

	export let rollTable: RollTable;

	const dispatch = createEventDispatcher<{
		roll: { roll: ReturnType<typeof rollFromTable> };
	}>();
</script>

<Button
	on:click={() => {
		let roll = rollFromTable(rollTable);
		dispatch('roll', { roll });
	}}
>
	<Dices />Roll
</Button>
