<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as DataTable from '$lib/components/ui/datatable';

	import type { TableViewModel } from 'svelte-headless-table';
	import { Button } from '$lib/components/ui/button';
	import { Cross } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import type { ImageType, Entity } from '../../../../app';

	import {
		pcTypes,
		hasImage,
		type pcType,
		type hasImageType,
		type hasDataType,
		hasData,
		type CRType,
		CRList,
		CR
	} from './data';
	import type { AnyPlugins } from 'svelte-headless-table/plugins';

	export let tableModel: TableViewModel<Entity, AnyPlugins>;
	export let selection: Writable<number[]>;

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
			pc: pcType[];
			hasImage: hasImageType[];
			hasData: hasDataType[];
			cr: CRType[];
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
			bind:filterValues={$filterValues.pc}
			title="PC Type"
			options={pcTypes}
		/>
		<DataTable.FacetedFilter
			bind:filterValues={$filterValues.hasImage}
			title="Has Image"
			options={hasImage}
		/>
		<DataTable.FacetedFilter
			bind:filterValues={$filterValues.hasData}
			title="Has Data"
			options={hasData}
		/>
		<DataTable.FacetedFilter bind:filterValues={$filterValues.cr} title="CR" options={CR} />
		{#if showReset}
			<Button
				on:click={() => {
					$filterValue = '';
					$filterValues.pc = [];
					$filterValues.hasData = [];
					$filterValues.hasImage = [];
					$filterValues.cr = [];
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
	<!-- <DataTableViewOptions {tableModel} /> -->
</div>
