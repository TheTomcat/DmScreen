<script lang="ts">
	import type { ListEntry } from '$lib/jsonschema';
	import { cn } from '$lib/utils';
	import ItemEntry from './ItemEntry.svelte';

	export let listEntry: ListEntry;
</script>

{#if listEntry}
	{@const className = listEntry?.style || ''}
	<div class={cn('grid grid-cols-[auto_1fr] gap-x-2', className)}>
		{#each listEntry.items as item}
			<ItemEntry itemEntry={item} />
		{/each}
	</div>
{/if}
