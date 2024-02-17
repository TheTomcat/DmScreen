<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { Writable } from 'svelte/store';
	import type { createSelection } from './data-table';

	// export let checked: Writable<boolean>;

	// export let id: number | undefined = undefined;

	// export let checked: boolean;
	// export let oncheck = (id: number) => {};
	// export let onuncheck = (id: number) => {};

	export let selection: ReturnType<typeof createSelection>;
	export let id: number | undefined;

	let selected: Writable<number[]>;
	let checked: boolean | undefined;

	const handleToggle = () => {
		if (id) {
			if (checked) {
				selection.removeID(id);
			} else {
				selection.addID(id);
			}
		} else {
			if (checked) selection.clear();
		}
		// console.log(id);
		// if (!id) return;
		// if (checked) {
		// 	onuncheck(id);
		// } else {
		// 	oncheck(id);
		// }
	};

	$: {
		selected = selection.selectedDataIDs;
	}

	$: {
		if (id) {
			checked = $selected.includes(id);
		} else {
			checked = $selected.length > 0;
		}
	}
</script>

<div class="flex justify-center">
	{#if id}
		<Checkbox bind:checked on:click={handleToggle} />
	{:else if $selected.length}
		<Checkbox bind:checked on:click={handleToggle} />
	{/if}
</div>
<!-- {#if id}{id}: {/if}<Checkbox bind:checked={$checked} on:change/> -->
