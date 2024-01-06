<script lang="ts">
	import type { ListEntry } from '$lib/jsonschema';
	import ItemEntry from './ItemEntry.svelte';

	export let listEntry: ListEntry;
</script>

{#if listEntry}
	{@const className = listEntry?.style || ''}
	<ul class={className}>
		{#each listEntry.items as item}
			<ItemEntry itemEntry={item} />
		{/each}
	</ul>
{/if}
