<script lang="ts">
	import type { ItemEntry } from '$lib/jsonschema';

	import { Textarea } from '$lib/components/ui/textarea';
	import TextBlock from './TextBlock.svelte';

	export let itemEntry: ItemEntry | string;
</script>

{#if typeof itemEntry == 'string'}
	<Textarea class="col-span-2" bind:value={itemEntry} />
{:else}
	{@const className = itemEntry?.style || ''}
	<!-- <li> -->
	<Textarea class={className} bind:value={itemEntry.name} />
	{#if 'entry' in itemEntry}
		<Textarea bind:value={itemEntry.entry} />
	{:else if itemEntry.entries}
		<div>
			{#each itemEntry.entries as entry}
				<Textarea bind:value={entry} />
			{/each}
		</div>
	{/if}
	<!-- </li> -->
{/if}
