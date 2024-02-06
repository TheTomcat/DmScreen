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
	import type { Collection, Image, ImageType, ImageURL, Tag } from '../../../../app';
	import { capitalise } from '$lib';
	import { SvelteComponent, onMount } from 'svelte';
	import DataTableTagList from './data-table-tag-list.svelte';

	// import data from './data.json';
	import * as DataTable from '$lib/components/ui/datatable';
	import Input from '$lib/components/ui/input/input.svelte';
	import { browser } from '$app/environment';
	import ImageTypeSelectBox from '$lib/components/ImageTypeSelectBox.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import DataTableLink from './data-table-entity-link.svelte';
	// import DataTableToolbar from './data-table-toolbar.svelte';

	import type { imageTypes } from './data';
	import CollectionSelectionBox from '$lib/components/new/CollectionSelectionBox.svelte';
	import { toast } from 'svelte-sonner';
	type imageType = (typeof imageTypes)[number]['value'];

	// let data: ImageURL[] = [];
	const dataStore = writable<ImageURL[]>([]);
	const totalCount = writable<number>(1);

	const selection = DataTable.createSelection();
	const { selectedDataIDs: selectedImageIDs } = selection;

	const getImages = async (
		page: number = 0,
		perPage: number = 20,
		q: string,
		types: string | undefined = undefined
	) => {
		// console.log('Getting ', { name: entityFilter, page, is_PC: showPCs });
		types = types ? types : undefined;
		return client
			.GET('/image/', {
				params: {
					query: { page: page + 1, size: perPage, name: q, types }
				}
			})
			.then((response) => {
				if (!response.data) return;
				totalCount.set(response.data.total || 0);
				dataStore.set(response.data.items);
			});
	};

	const createNewCollection = async (name: string) => {
		return await client
			.POST('/collection/', {
				body: { name }
			})
			.then((response) => {
				if (!response || !response.data) return;
				return response.data;
			});
	};

	const addImagesToCollection = (collection: Collection, images: number[]) => {
		return Promise.all(
			images.map((i) => {
				return client
					.PATCH('/image/{image_id}/collection', {
						params: {
							path: { image_id: i },
							query: { collection_id: collection.collection_id }
						}
					})
					.then((response) => {
						if (!response || response.error) throw new Error('A problem hath occurred');
					});
			})
		);
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
		select: addSelectedRows({}),
		colFilter: addColumnFilters({ serverSide: true })
	});

	const columns = table.createColumns([
		table.column({
			accessor: ({ image_id }) => image_id,
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
		// table.column({
		// 	accessor: 'image_id',
		// 	header: 'ID'
		// }),
		table.column({
			accessor: ({ entities }) => entities,
			header: 'Has Entity',
			cell: ({ value }) => {
				return createRender(DataTableLink, { entities: value || [] });
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
		}),
		table.column({
			accessor: ({ type, image_id }) => {
				return { type, image_id };
			},
			header: 'Image Type',
			cell: ({ value }) => {
				let { type, image_id } = value;
				return createRender(ImageTypeSelectBox, {
					selected: type,
					onSelectedChange: () =>
						client.PATCH('/image/{image_id}', {
							params: { path: { image_id } },
							body: { type }
						})
				});
			}
		})
		// table.column({
		// 	accessor: 'palette',
		// 	header: 'Palette'
		// })
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
			type: imageType[];
		}>;
	} = pluginStates.colFilter;

	const { selectedDataIds } = pluginStates.select;

	$: {
		if (browser && $filterValues && $filterValues.type) {
			// console.log($pageIndex, $pageSize);
			// console.log($filterValues);
			getImages($pageIndex, $pageSize, $filterValue, $filterValues.type.join('|'));
		}
	}

	const handleNewCollection = (e: CustomEvent<{ name: string; items: number[] }>) => {
		createNewCollection(e.detail.name)
			.then((response) => {
				if (!response) throw new Error('Invalid Response');
				return addImagesToCollection(response, $selectedImageIDs);
			})
			.then((r) => {
				console.log(r);
				toast(`Added images successfully`);
			})
			.catch(() => {
				toast('An error occurred.');
			});
	};
	const handleExistingCollection = (
		e: CustomEvent<{ collection: Collection; items: number[] }>
	) => {
		addImagesToCollection(e.detail.collection, e.detail.items)
			.then(() => {
				toast('Added images successfully');
			})
			.catch(() => {
				toast('An error occurred.');
			});
	};
</script>

<div class="space-y-4">
	<DataTableToolbar
		{tableModel}
		selection={selection.selectedDataIDs}
		on:addToExistingCollection={handleExistingCollection}
		on:newCollection={handleNewCollection}
	/>
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
