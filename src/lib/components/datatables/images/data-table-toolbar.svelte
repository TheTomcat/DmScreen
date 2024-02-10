<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as DataTable from '$lib/components/ui/datatable';

	// import type { AnyPlugins } from "svelte-headless-table/lib/types/TablePlugin";
	// import type { Task } from "../(data)/schemas";
	import type { TableViewModel } from 'svelte-headless-table';
	import { Button } from '$lib/components/ui/button';
	import { Cross, GalleryHorizontalEnd } from 'lucide-svelte';
	// import { statuses, priorities } from "../(data)/data";
	import type { Writable } from 'svelte/store';
	import type { Collection, ImageType, ImageURL } from '../../../../app';

	export let tableModel: TableViewModel<ImageURL, any>;
	export let selection: Writable<number[]>;
	import { imageTypes } from './data';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import CollectionSelectionBox from '$lib/components/new/CollectionSelectionBox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { plural } from '$lib';

	const dispatch = createEventDispatcher<{
		newCollection: { name: string; items: number[] };
		addToExistingCollection: { collection: Collection; items: number[] };
	}>();

	let currentCollection: Collection | undefined;
	let createNewCollection = false;
	let newCollectionName = '';
	let open = false;

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
			type: ImageType[];
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

		<DataTable.FacetedFilter
			bind:filterValues={$filterValues.type}
			title="Image Type"
			options={imageTypes}
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
					$filterValues.type = [];
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

		<Dialog.Root bind:open>
			<Dialog.Trigger>
				<Button
					disabled={$selection.length == 0}
					on:click={() => {
						createNewCollection = false;
					}}><GalleryHorizontalEnd class="w-4 h-4 mr-1" />Add to Collection</Button
				>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Add to Collection</Dialog.Title>
					<Dialog.Description>
						Add {$selection.length} images to a collection
					</Dialog.Description>
				</Dialog.Header>

				{#if !createNewCollection}
					<CollectionSelectionBox
						bind:currentCollection
						allowNew={true}
						on:newCollection={() => {
							createNewCollection = true;
						}}
					/>
				{:else}
					<div class="grid grid-cols-4 items-center gap-4">
						<!-- <Label class="text-right">Name</Label>
						<Input id="name" value="Pedro Duarte" class="col-span-3" /> -->
						<Label class="text-right">Collection Name</Label>
						<Input id="name" bind:value={newCollectionName} class="col-span-3" />
					</div>
				{/if}
				<Dialog.Footer class="flex justify-between gap-2">
					<Button
						variant="secondary"
						on:click={() => {
							open = false;
						}}>Cancel</Button
					>
					<Button
						on:click={() => {
							if (createNewCollection) {
								dispatch('newCollection', {
									name: newCollectionName,
									items: $selection
								});
								// toast(`${$selection.length} images added to new collection ${newCollectionName}`);
							} else {
								if (currentCollection) {
									dispatch('addToExistingCollection', {
										collection: currentCollection,
										items: $selection
									});
									// toast(
									// 	`${$selection.length} ${plural(
									// 		$selection.length,
									// 		'image'
									// 	)} added to existing collection ${currentCollection.name}`
									// );
								}
							}
							open = false;
						}}>Confirm</Button
					>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	<!-- <DataTableViewOptions {tableModel} /> -->
</div>
