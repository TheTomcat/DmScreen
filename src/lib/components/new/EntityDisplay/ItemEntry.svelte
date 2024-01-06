<script lang="ts">
	import type { ItemEntry } from '$lib/jsonschema';
	import TextBlock from './TextBlock.svelte';

	export let itemEntry: ItemEntry | string;
</script>

{#if typeof itemEntry == 'string'}
	<li><TextBlock text={itemEntry} /></li>
{:else}
	{@const className = itemEntry?.style || ''}
	<li>
		<p class={className}><TextBlock text={itemEntry.name} /></p>
		{#if itemEntry.entry}
			<p><TextBlock text={itemEntry.entry} /></p>
		{:else if itemEntry.entries}
			{#each itemEntry.entries as entry}
				<p><TextBlock text={entry} /></p>
			{/each}
		{/if}
	</li>
{/if}
