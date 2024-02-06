<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as DataTable from '$lib/components/ui/datatable';

	// import type { AnyPlugins } from "svelte-headless-table/lib/types/TablePlugin";
	// import type { Task } from "../(data)/schemas";
	import type { TableViewModel } from 'svelte-headless-table';
	import { Button } from '$lib/components/ui/button';
	import { Cross, GalleryHorizontalEnd, PlusCircle } from 'lucide-svelte';
	// import { statuses, priorities } from "../(data)/data";
	import type { Writable } from 'svelte/store';
	import type { Collection, ImageType, Combat } from '../../../../app';

	export let tableModel: TableViewModel<Combat, any>;
	export let selection: Writable<number[]>;
	// import { imageTypes } from './data';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import CollectionSelectionBox from '$lib/components/new/CollectionSelectionBox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { plural } from '$lib';

	const dispatch = createEventDispatcher<{
		newCombat: undefined;
		//addToExistingCollection: { collection: Collection; items: number[] };
	}>();

	// let currentCollection: Collection | undefined;
	// let createNewCollection = false;
	// let newCollectionName = '';
	// let open = false;

	let options: string[] = ['a', 'b'];

	const { pluginStates } = tableModel;
	const {
		filterValue
	}: {
		filterValue: Writable<string>;
	} = pluginStates.filter;

	const {
		filterValues
	}: {
		filterValues: Writable<{
			participantNames: string[];
		}>;
	} = pluginStates.colFilter;

	$: showReset = Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0);
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="Search..."
			class="h-8 w-[150px] lg:w-[250px]"
			type="search"
			bind:value={$filterValue}
		/>

		<DataTable.FreetextFilter
			title="Select Participants..."
			bind:options={$filterValues.participantNames}
		/>
		<!-- <DataTableFacetedFilter
			bind:filterValues={$filterValues.priority}
			title="Priority"
			options={priorities} -->
		<!-- /> -->
		{#if showReset}
			<Button
				on:click={() => {
					$filterValue = '';
					$filterValues.participantNames = [];
				}}
				variant="ghost"
				class="h-8 px-2 lg:px-3"
			>
				Reset
				<Cross class="ml-2 h-4 w-4" />
			</Button>
		{/if}
	</div>
	<div class="flex-1 text-sm text-muted-foreground text-right">
		{$selection.length} entities selected.
	</div>
	<Button class="ml-2"><PlusCircle class="h-4 w-4 mr-1" />New</Button>
	<!-- <DataTableViewOptions {tableModel} /> -->
</div>
