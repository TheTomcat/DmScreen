<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import * as Table from '$lib/components/ui/table';
	import { get, writable, type Writable } from 'svelte/store';
	import {
		addPagination,
		addTableFilter,
		addSelectedRows,
		addColumnFilters,
		addHiddenColumns,
		addSortBy
	} from 'svelte-headless-table/plugins';

	import client from '$lib/api/index';
	import type { Combat, Participant } from '../../../../app';
	import { capitalise } from '$lib';
	import { createEventDispatcher, onMount } from 'svelte';
	// import DataTableTagList from './data-table-tag-list.svelte';

	// import data from './data.json';
	import * as DataTable from '$lib/components/ui/datatable';
	import Input from '$lib/components/ui/input/input.svelte';
	import { browser } from '$app/environment';
	import DataTableToolbar from '$lib/components/datatables/combats/data-table-toolbar.svelte';
	import DataTableLoadCombat from './data-table-load-combat.svelte';
	// import DataTableLink from './data-table-entity-link.svelte';
	// import DataTableToolbar from './data-table-toolbar.svelte';

	// import type { imageTypes } from './data';
	import CollectionSelectionBox from '$lib/components/new/CollectionSelectionBox.svelte';
	import { toast } from 'svelte-sonner';
	import type { wsController } from '$lib/ws';
	// type imageType = (typeof imageTypes)[number]['value'];

	// let data: ImageURL[] = [];

	export let ws: wsController | undefined = undefined;

	const dataStore = writable<Combat[]>([]);
	const totalCount = writable<number>(1);

	const dispatch = createEventDispatcher<{
		newCombat: { combat: Combat };
		runCombat: { combat: Combat };
	}>();

	const selection = DataTable.createSelection();
	const { selectedDataIDs: selectedImageIDs } = selection;

	const getCombats = async (
		page: number = 0,
		perPage: number = 20,
		q: string,
		combat_participants_name: string
		// num_participants: [number | undefined, number | undefined]
	) => {
		// console.log('Getting ', { name: entityFilter, page, is_PC: showPCs });
		return client
			.GET('/combat/', {
				params: {
					query: {
						page: page + 1,
						size: perPage,
						title: q,
						combat_participants_name,
						//@ts-ignore
						sort_by: $sortKeys[0].id,
						sort_dir: $sortKeys[0].order
						// combat_participants_at_least: num_participants[0],
						// combat_participants_at_most: num_participants[1]
					}
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
			includeHiddenColumns: true,
			fn: ({ filterValue, value }) => {
				return value.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase());
			}
		}),
		select: addSelectedRows({}),
		colFilter: addColumnFilters({ serverSide: true }),
		hidden: addHiddenColumns({
			initialHiddenColumnIds: ['numParticipants']
		}),
		sort: addSortBy({
			serverSide: true,
			disableMultiSort: true,
			initialSortKeys: [{ id: 'title', order: 'asc' }]
		})
	});

	const columns = table.createColumns([
		table.column({
			accessor: ({ combat_id }) => combat_id,
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTable.Checkbox, {
					selection,
					id: undefined
				});
			},
			cell: ({ row, value }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTable.Checkbox, {
					selection,
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
			id: 'numParticipants',

			plugins: {
				colFilter: {
					fn: ({ filterValue, value }) => {
						console.log(filterValue, value);
						return true;
					},
					initialFilterValue: [1, 20],
					render: ({ filterValue }) => {
						console.log(get(filterValue));
						return get(filterValue);
					}
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
		}),
		table.column({
			id: 'selectCombat',
			accessor: (combat) => combat,
			header: 'Load Combat',
			cell: ({ row, value }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableLoadCombat, {
					combat: value,
					ws: ws
				}).on('runCombat', (e: CustomEvent<{ combat: Combat }>) => {
					dispatch('runCombat', { combat: e.detail.combat });
				});
			}
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
			numParticipants: [number | undefined, number | undefined];
		}>;
	} = pluginStates.colFilter;

	const { selectedDataIds } = pluginStates.select;

	const { hiddenColumnIds } = pluginStates.hidden;

	const { sortKeys } = pluginStates.sort;

	$: {
		if (
			browser &&
			$filterValues &&
			$filterValues.participantNames !== undefined
			// $filterValues.numParticipants !== undefined
		) {
			// console.log($pageIndex, $pageSize);
			getCombats(
				$pageIndex,
				$pageSize,
				$filterValue,
				$filterValues.participantNames.join('|')
				// $filterValues.numParticipants
			);
		}
	}

	const render_participants = (p: Participant[]): string => {
		return `${p.length}: ${p.filter((p) => p.is_PC).length}+${p.filter((p) => !p.is_PC).length}`;
	};

	const newCombat = (e: CustomEvent<{ combat: Combat }>) => {
		dispatch('newCombat', { combat: e.detail.combat });
		$filterValue = ' ';
		$filterValue = '';
	};

	$: {
		if (!ws) {
			$hiddenColumnIds = [...$hiddenColumnIds, 'selectCombat'];
		} else {
			$hiddenColumnIds = $hiddenColumnIds.filter((s) => s !== 'selectCombat');
		}
	}
</script>

{JSON.stringify($sortKeys)}
<div class="space-y-4">
	<DataTableToolbar {tableModel} selection={selection.selectedDataIDs} on:newCombat={newCombat} />

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
