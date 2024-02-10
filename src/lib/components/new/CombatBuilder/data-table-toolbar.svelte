<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as DataTable from '$lib/components/ui/datatable';

	import type { TableViewModel } from 'svelte-headless-table';
	import { Button } from '$lib/components/ui/button';
	import { Cross, Filter, FilterX } from 'lucide-svelte';
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
	} from '$lib/components/datatables/entities/data';
	import type { AnyPlugins } from 'svelte-headless-table/plugins';
	import * as Popover from '$lib/components/ui/popover';

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

	const resetFilters = () => {
		$filterValue = '';
		$filterValues.pc = [];
		$filterValues.hasData = [];
		$filterValues.hasImage = [];
		$filterValues.cr = [];
	};

	$: showReset = Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0);
</script>

<div class="flex flex-col">
	<div class="flex flex-row w-full gap-1">
		<Input placeholder="Search..." class="h-8 w-[full]" type="search" bind:value={$filterValue} />
		<!-- <div class="flex flex-1 items-center space-x-2"></div> -->
		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" class="h-8"
					><Filter class="h-4 w-4 mr-1" />Filter</Button
				>
			</Popover.Trigger>
			<Popover.Content class="w-80">
				<div class="grid gap-4">
					<div class="space-y-2">
						<h4 class="font-medium leading-none">Filters</h4>
						<p class="text-sm text-muted-foreground">Set the filters.</p>
					</div>
					<div class="grid gap-2">
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
						<Button on:click={resetFilters} class="h-8 px-2 lg:px-3" disabled={!showReset}>
							<FilterX class="mr-1 h-4 w-4" />
							Clear Filters
						</Button>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
		<!-- {#if showReset} -->
		<Button on:click={resetFilters} variant="ghost" class="h-8 px-2 lg:px-3" disabled={!showReset}>
			<FilterX class="mr-1 h-4 w-4" />
			Reset
		</Button>
		<!-- {/if} -->
		<!-- </div> -->
	</div>
	<!-- <DataTableViewOptions {tableModel} /> -->
</div>
