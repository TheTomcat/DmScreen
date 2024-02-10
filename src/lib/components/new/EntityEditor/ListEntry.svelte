<script lang="ts">
	import type { ListEntry, ItemEntry as ItmEntry } from '$lib/jsonschema';
	import { cn } from '$lib/utils';
	import { PlusSquare, Trash2 } from 'lucide-svelte';
	import ItemEntry from './ItemEntry.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	export let listEntry: ListEntry;

	const removeEntry = (i: number) => {
		return () => {
			console.log('asf');
			let discard = listEntry.items.splice(i, 1);
			listEntry = listEntry;
			// listEntry = {
			// 	...listEntry,
			// 	//@ts-ignore
			// 	items: [...listEntry.items.slice(0, i), ...listEntry.items.slice(i)]
			// };
		};
	};
	const addEntry = () => {
		console.log('ASDF');
		listEntry = {
			...listEntry,
			//@ts-ignore
			items: [...listEntry.items, newItem(listEntry.items)]
		};
	};

	const newItem = (items: ItmEntry[] | string[]): ItmEntry | string => {
		if (typeof items[0] == 'string') return '';
		return {
			type: 'item',
			style: '',
			name: '',
			entry: ''
		};
	};
</script>

{#if listEntry}
	{@const className = listEntry?.style || ''}
	<div>
		{#if typeof listEntry.items[0] == 'string'}Strlist{:else}DynList{/if}
		{#each listEntry.items as item, i}
			<div class="grid grid-cols-[1fr_auto]">
				<div class={cn('grid grid-cols-[auto_1fr] gap-x-2', className)}>
					<ItemEntry itemEntry={item} />
				</div>
				<Button on:click={removeEntry(i)}><Trash2 />xxx</Button>
			</div>
		{/each}
		<Button on:click={addEntry}><PlusSquare /></Button>
	</div>
{/if}
