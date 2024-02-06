<script lang="ts">
	import type { ItemEntry } from '$lib/jsonschema';
	import TextBlock from './TextBlock.svelte';

	export let itemEntry: ItemEntry | string;
</script>

{#if typeof itemEntry == 'string'}
	<div class="col-span-2"><TextBlock text={itemEntry} /></div>
{:else}
	{@const className = itemEntry?.style || ''}
	<!-- <li> -->
	<div class={className}><TextBlock text={itemEntry.name} /></div>
	{#if itemEntry.entry}
		<div><TextBlock text={itemEntry.entry} /></div>
	{:else if itemEntry.entries}
		<div>
			{#each itemEntry.entries as entry}
				<p><TextBlock text={entry} /></p>
			{/each}
		</div>
	{/if}
	<!-- </li> -->
{/if}
