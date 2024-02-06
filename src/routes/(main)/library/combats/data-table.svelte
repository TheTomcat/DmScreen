<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import ImageTag from '$lib/components/ImageTag.svelte';
	import * as Table from '$lib/components/ui/table';
	import { get, writable, type Writable } from 'svelte/store';
	import {
		addPagination,
		addTableFilter,
		addSelectedRows,
		addColumnFilters
	} from 'svelte-headless-table/plugins';

	import client from '$lib/api/index';
	import type {
		Collection,
		Combat,
		Image,
		ImageType,
		ImageURL,
		Participant,
		Tag
	} from '../../../../app';
	import { capitalise } from '$lib';
	import { SvelteComponent, onMount } from 'svelte';
	// import DataTableTagList from './data-table-tag-list.svelte';

	// import data from './data.json';
	import * as DataTable from '$lib/components/ui/datatable';
	import Input from '$lib/components/ui/input/input.svelte';
	import { browser } from '$app/environment';
	import ImageTypeSelectBox from '$lib/components/ImageTypeSelectBox.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';
	// import DataTableLink from './data-table-entity-link.svelte';
	// import DataTableToolbar from './data-table-toolbar.svelte';

	// import type { imageTypes } from './data';
	import CollectionSelectionBox from '$lib/components/new/CollectionSelectionBox.svelte';
	import { toast } from 'svelte-sonner';
	// type imageType = (typeof imageTypes)[number]['value'];

	// let data: ImageURL[] = [];
	const dataStore = writable<Combat[]>([]);
	const totalCount = writable<number>(1);

	const selection = DataTable.createSelection();
	const { selectedDataIDs: selectedImageIDs } = selection;

	const getCombats = async (
		page: number = 0,
		perPage: number = 20,
		q: string,
		numParticipants: number,
		combat_participants_name: string
	) => {
		// console.log('Getting ', { name: entityFilter, page, is_PC: showPCs });
		return client
			.GET('/combat/', {
				params: {
					query: { page: page + 1, size: perPage, title: q, combat_participants_name }
				}
			})
			.then((response) => {
				if (!response.data) return;
				totalCount.set(response.data.total || 0);
				dataStore.set(response.data.items);
			});
	};

	const table = createTable(dataStore, {
		page: addPagination({
			serverSide: true,
			serverItemCount: totalCount,
			initialPageIndex: 1,
			initialPageSize: 20
		}),
		filter: addTableFilter({
			serverSide: true,
			fn: ({ filterValue, value }) => {
				return value.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase());
			}
		}),
		select: addSelectedRows({}),
		colFilter: addColumnFilters({ serverSide: true })
	});

	const columns = table.createColumns([
		table.column({
			accessor: ({ combat_id }) => combat_id,
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTable.Checkbox, {
					selection,
					// checked: get(allPageRowsSelected),
					// oncheck: () => {},
					// onuncheck: selection.clear,
					id: undefined
				});
			},
			cell: ({ row, value }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTable.Checkbox, {
					selection,
					// checked: get(selectedImageIDs).includes(value),
					// oncheck: selection.addID,
					// onuncheck: selection.removeID,
					id: value
				});
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: ({ participants }) => participants,
			header: 'Num Participants',
			id: 'participantNames',
			cell: ({ value }) => {
				return render_participants(value);
			},
			plugins: {
				colFilter: {
					fn: ({ filterValue, value }) => {
						console.log(filterValue, value);
						/*if (filterValue.length === 0) return true;
						if (!Array.isArray(filterValue) || typeof value !== 'string') return true;
						return filterValue.some((filter) => {
							return value.includes(filter);
						});*/
						return true;
					},
					initialFilterValue: [],
					render: ({ filterValue }) => {
						console.log(get(filterValue));
						return get(filterValue);
					}
				}
			}
		}),
		table.column({
			accessor: 'title',
			header: 'Title'
		})
	]);

	const tableModel = table.createViewModel(columns);
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = tableModel;

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;
	const { filterValue } = pluginStates.filter;
	//@ts-ignore
	const {
		filterValues
	}: {
		filterValues: Writable<{
			participantNames: string[];
		}>;
	} = pluginStates.colFilter;

	const { selectedDataIds } = pluginStates.select;

	$: {
		if (browser && $filterValues && $filterValues.participantNames !== undefined) {
			// console.log($pageIndex, $pageSize);
			getCombats($pageIndex, $pageSize, $filterValue, 0, $filterValues.participantNames.join('|'));
		}
	}

	const render_participants = (p: Participant[]): string => {
		return `${p.length}: ${p.filter((p) => p.is_PC).length}+${p.filter((p) => !p.is_PC).length}`;
	};
</script>

<div class="space-y-4">
	<DataTableToolbar {tableModel} selection={selection.selectedDataIDs} />
	<!-- <div class="flex items-center py-4">
		<Input
			class="max-w-sm"
			placeholder="Filter image names"
			type="text"
			bind:value={$filterValue}
		/>
	</div> -->
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										<Render of={cell.render()} />
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										<Render of={cell.render()} />
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTable.Pagination {tableModel} />
</div>
