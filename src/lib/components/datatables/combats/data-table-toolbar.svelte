<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as DataTable from '$lib/components/ui/datatable';
	import * as Dialog from '$lib/components/ui/dialog';
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

	import * as Card from '$lib/components/ui/card';
	import CollectionSelectionBox from '$lib/components/new/CollectionSelectionBox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { plural } from '$lib';
	import CombatBuilder from '$lib/components/new/CombatBuilder/CombatBuilder.svelte';
	import Slider from '$lib/components/ui/slider/slider.svelte';
	import DataTableRange from './data-table-range.svelte';

	const dispatch = createEventDispatcher<{
		newCombat: { combat: Combat };
	}>();

	let open: boolean = false;

	// let currentCollection: Collection | undefined;
	// let createNewCollection = false;
	// let newCollectionName = '';
	// let open = false;

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
			num_participants: [number | null, number | null];
		}>;
	} = pluginStates.colFilter;

	$: showReset = Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0);

	const newCombat = (e: CustomEvent<{ combat: Combat }>) => {
		open = false;
		dispatch('newCombat', { combat: e.detail.combat });
	};
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
		<DataTableRange bind:filterValues={$filterValues.num_participants} title="Participants..." />

		{#if showReset}
			<Button
				on:click={() => {
					$filterValue = '';
					$filterValues.participantNames = [];
					$filterValues.num_participants = [null, null];
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
		{$selection.length}
		{plural($selection.length, 'combat')} selected.
	</div>
	<Button
		class="ml-2 h-8 px-2 lg:px-3"
		on:click={() => {
			open = true;
		}}
	>
		<PlusCircle class="h-4 w-4 mr-2" />New
	</Button>
	<!-- <DataTableViewOptions {tableModel} /> -->
</div>

<Dialog.Root bind:open closeOnOutsideClick={false}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>New Combat</Dialog.Title>
			<Dialog.Description>Create a new combat</Dialog.Description>
		</Dialog.Header>
		<CombatBuilder on:newCombat={newCombat} />
		<Dialog.Footer
			><Button
				variant="destructive"
				on:click={() => {
					open = false;
				}}
			>
				Close
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
