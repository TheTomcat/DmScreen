<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import ImageTag from '$lib/components/ImageTag.svelte';
	import * as Table from '$lib/components/ui/table';
	import { writable } from 'svelte/store';
	import { addPagination, addTableFilter, addSelectedRows } from 'svelte-headless-table/plugins';
	import DataTableCheckbox from './data-table-checkbox.svelte';

	import client from '$lib/api/index';
	import type { ImageURL, Tag } from '../../../../app';
	import { capitalise } from '$lib';
	import { SvelteComponent, onMount } from 'svelte';
	import DataTableTagList from './data-table-tag-list.svelte';

	import data from './data.json';
	import DataTablePagination from './data-table-pagination.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { browser } from '$app/environment';
	// import DataTableToolbar from './data-table-toolbar.svelte';

	// let data: ImageURL[] = [];
	const dataStore = writable<ImageURL[]>(data.items as ImageURL[]);
	const totalCount = writable<number>(1);

	const getImages = async (page: number = 0, perPage: number = 20) => {
		// console.log('Getting ', { name: entityFilter, page, is_PC: showPCs });
		return client
			.GET('/image/', {
				params: {
					query: { page: page + 1, size: perPage }
				}
			})
			.then((response) => {
				if (!response.data) return;
				totalCount.set(response.data.total || 0);
				dataStore.set(response.data.items);
			});
	};

	// onMount(() => {
	// 	getImages(1).then((response) => {
	// 		if (!response || !response.data) return;
	// 		dataStore.set(response.data.items);
	// 	});
	// });

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
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'image_id',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			accessor: ({ tags }) => tags,
			header: 'Tags',
			cell: ({ value }) => {
				return createRender(DataTableTagList, { taglist: value });
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		})
	]);

	const tableModel = table.createViewModel(columns);
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = tableModel;

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;
	const { filterValue } = pluginStates.filter;

	const { selectedDataIds } = pluginStates.select;

	$: {
		if (browser) {
			// console.log($pageIndex, $pageSize);
			getImages($pageIndex, $pageSize);
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center py-4">
		<Input
			class="max-w-sm"
			placeholder="Filter image names"
			type="text"
			bind:value={$filterValue}
		/>
	</div>
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
				{#each $pageRows as row (row.id)}
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
	<DataTablePagination {tableModel} />
</div>
