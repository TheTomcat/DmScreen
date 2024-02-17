<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';

	import * as Table from '$lib/components/ui/table';
	import { get, writable, type Writable } from 'svelte/store';
	import {
		addPagination,
		addTableFilter,
		addSelectedRows,
		addColumnFilters,
		addSortBy,
		addHiddenColumns
	} from 'svelte-headless-table/plugins';
	// import DataTableCheckbox from './data-table-checkbox.svelte';

	import client from '$lib/api/index';
	import type { Entity } from '../../../../app';

	import * as DataTable from '$lib/components/ui/datatable';
	import { browser } from '$app/environment';

	import type { pcTypes, pcType, hasImage, hasImageType, hasDataType, CR, CRType } from './data';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import DataTablePcCell from './data-table-pc-cell.svelte';
	import DataTableImage from './data-table-image.svelte';
	import DataTableMetadata from './data-table-metadata.svelte';
	import DataTableData from './data-table-data.svelte';
	import { decodeCR } from '$lib';

	const dataStore = writable<Entity[]>([]);
	const totalCount = writable<number>(1);
	const selection = DataTable.createSelection();
	const { selectedDataIDs: selectedEntityIDs } = selection;

	const getEntities = async (
		page: number = 0,
		size: number = 20,
		name: string,
		pc: pcType[],
		hasImage: hasImageType[],
		hasData: hasDataType[],
		crs: CRType[],
		sources: string[]
	) => {
		let is_PC: boolean | undefined =
			pc.length == 0 || pc.length == 2 ? undefined : pc.includes('pc');
		// pc === 'pc,npc' ? undefined : pc === 'pc' ? true : pc === 'npc' ? false : undefined;
		let has_image: boolean | undefined =
			hasImage.length == 0 || hasImage.length == 2 ? undefined : hasImage.includes('image');
		// hasImage == 'image' ? true : hasImage == 'noimage' ? false : undefined;
		let has_data: boolean | undefined =
			hasData.length == 0 || hasData.length == 2 ? undefined : hasData.includes('data');
		let cr = crs.length == 0 ? undefined : crs.join('|');
		let source = sources.length == 0 ? undefined : sources.join('|');
		// hasData == 'data' ? true : hasData == 'nodata' ? false : undefined;
		// let has_image: boolean | undefined =
		// hasimage === 'pc,npc' ? undefined : pc === 'pc' ? true : pc === 'npc' ? false : undefined;
		return client
			.GET('/entity/', {
				params: {
					query: {
						page: page + 1,
						size,
						name,
						is_PC,
						has_image,
						has_data,
						cr,
						source,
						sort_by: $sortKeys[0].id as 'name' | 'ac' | 'cr' | 'initiative' | null,
						sort_dir: $sortKeys[0].order
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
			serverSide: true
			// fn: ({ filterValue, value }) => {
			// 	return value.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase());
			// }
		}),
		select: addSelectedRows({}),
		colFilter: addColumnFilters({ serverSide: true }),
		sort: addSortBy({
			serverSide: true,
			disableMultiSort: true,
			initialSortKeys: [{ id: 'name', order: 'asc' }],
			toggleOrder: ['asc', 'desc']
		}),
		hide: addHiddenColumns({ initialHiddenColumnIds: ['seq'] })
		// col2Filter: addColumnFilters()
	});

	const columns = table.createColumns([
		table.column({
			accessor: ({ entity_id }) => entity_id,
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTable.Checkbox, {
					selection,
					// checked: allPageRowsSelected
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
					// checked: isSelected,
					selection: selection,
					// checked: get(selectedEntityIDs).includes(value),
					// oncheck: selection.addID,
					// onuncheck: selection.removeID,
					id: value
				});
			}
		}),
		table.column({
			accessor: ({ entity_id }) => entity_id,
			header: 'ID'
		}),
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			accessor: ({ cr }) => cr,
			header: 'CR',
			id: 'cr',
			cell: ({ value }) => decodeCR(value) || ''
		}),
		table.column({
			accessor: ({ ac }) => ac,
			header: 'AC',
			id: 'ac'
		}),
		// table.column({
		// 	accessor: ({ image_id }) => {
		// 		return { image_id, hasImage: !!image_id };
		// 	},
		// 	header: 'Has Image',
		// 	id: 'hasimage',
		// 	cell: ({ value }) => {
		// 		return createRender(DataTableImage, { image_id: value.image_id });
		// 	}

		// 	// plugins: {
		// 	// 	col2Filter: {
		// 	// 		fn: ({ filterValue, value }) => {
		// 	// 			// console.log(filterValue, value);
		// 	// 			if (filterValue.length === 0) return true;
		// 	// 			if (filterValue.length === 2) return true;
		// 	// 			if (!Array.isArray(filterValue)) return true;
		// 	// 			return filterValue.includes('hasimage') == value.hasImage;
		// 	// 		},
		// 	// 		initialFilterValue: [],
		// 	// 		render: ({ filterValue }) => {
		// 	// 			return get(filterValue);
		// 	// 		}
		// 	// 	}
		// 	// }
		// }),
		table.column({
			accessor: (entity) => entity,
			header: 'Has Data',
			cell: ({ value }) => {
				return createRender(DataTableMetadata, { entity: value, show_null: false });
			}
		}),

		table.column({
			accessor: ({ is_PC }) => (is_PC ? 'pc' : 'npc'),
			header: 'PC',
			id: 'pc',
			cell: ({ value }) => {
				return createRender(DataTablePcCell, { value });
			}
			// plugins: {
			// 	colFilter: {
			// 		fn: ({ filterValue, value }) => {
			// 			if (filterValue.length === 0) return true;
			// 			if (!Array.isArray(filterValue) || typeof value !== 'string') return true;
			// 			return filterValue.some((filter) => {
			// 				return value.includes(filter);
			// 			});
			// 		},
			// 		initialFilterValue: 'pc'
			// 	}
			// }
		}),
		table.column({
			accessor: ({ source, source_page }) => {
				return { source, source_page };
			},
			header: 'Source',
			id: 'source',
			cell: ({ value }) => (value.source ? `${value.source} p${value.source_page}` : '')
		}),
		table.column({
			header: 'Seq',
			accessor: 'seq'
		})
	]);

	const tableModel = table.createViewModel(columns);
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = tableModel;

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;
	const { filterValue } = pluginStates.filter;

	// @ts-ignore
	const {
		filterValues
	}: {
		filterValues: Writable<{
			pc: pcType[];
			hasImage: hasImageType[];
			hasData: hasDataType[];
			cr: CRType[];
			source: string[];
		}>;
	} = pluginStates.colFilter;

	// @ts-ignore
	// const {
	// 	filterValues: filterValues2
	// }: {
	// 	filterValues: Writable<{
	// 		hasimage: hasImageType[];
	// 	}>;
	// } = pluginStates.col2Filter;

	const { sortKeys } = pluginStates.sort;

	const { selectedDataIds } = pluginStates.select;

	$: {
		if (
			browser &&
			$filterValues &&
			$filterValues.pc &&
			$filterValues.hasData &&
			$filterValues.hasImage &&
			$filterValues.cr &&
			$filterValues.source
		) {
			//&& $filterValues && $filterValues.pc) {
			$sortKeys;
			getEntities(
				$pageIndex,
				$pageSize,
				$filterValue,
				$filterValues.pc,
				$filterValues.hasImage,
				$filterValues.hasData,
				$filterValues.cr,
				$filterValues.source
			);
		}
	}
</script>

<div class="space-y-4">
	<DataTableToolbar {tableModel} selection={selection.selectedDataIDs} />
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										{#if cell.id == 'name' || cell.id == 'id' || cell.id == 'cr' || cell.id == 'ac' || cell.id == 'source'}
											<DataTable.HeadingSort {props}>
												<Render of={cell.render()} />
											</DataTable.HeadingSort>
										{:else}
											<Render of={cell.render()} />
										{/if}
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
