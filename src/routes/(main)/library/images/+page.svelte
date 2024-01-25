<script lang="ts">
	import { browser } from '$app/environment';
	import { capitalise, debounce } from '$lib';
	import client from '$lib/api/index';
	// import Pagination from '$lib/components/Pagination.svelte';
	import PaginationStub from '$lib/components/PaginationStub.svelte';
	import { onMount } from 'svelte';
	import type { ImageURL } from '../../../../app';
	import DataTable from './data-table.svelte';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Table from '$lib/components/ui/table';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { mediaQuery } from 'svelte-legos';

	const isDesktop = mediaQuery('(min-width: 768px)');

	// let count = 20;
	$: perPage = $isDesktop ? 20 : 20;
	$: siblingCount = $isDesktop ? 1 : 0;

	let numResults: number = -1;
	let nextPage: number = 1;
	let currentPage: number = 1;
	let numPages: number = 1;

	let loadingImages: boolean = false;
	let loadingMoreImages: boolean = false;

	let filteredImages: ImageURL[] = [];

	let imageDiv: HTMLDivElement;
	let observerRow: HTMLTableRowElement;

	const getImages = async (page: number = 1) => {
		// console.log('Getting ', { name: entityFilter, page, is_PC: showPCs });
		return client.GET('/image/', {
			params: {
				query: { page, size: perPage }
			}
		});
	};

	type ImagesResponse = Awaited<ReturnType<typeof getImages>> | undefined;

	const infiniteScroll = (getNextPage: () => {}, element: HTMLElement) => {
		if (element) {
			const observer = new IntersectionObserver(
				(entries) => {
					const first = entries[0];
					if (first.isIntersecting) {
						console.log('Is Intersecting');
						getNextPage();
					}
				},
				{ threshold: 1 }
			);
			observer.observe(element); //Element of DOM
		}
	};

	const handleResponse = (response: ImagesResponse) => {
		if (!response || !response.data) return;
		currentPage = response.data.page || 1;
		numPages = response.data.pages || 1;
		numResults = response.data.total || -1;
		nextPage =
			(response.data.page || 1) < (response.data.pages || 1) ? (response.data.page || 1) + 1 : -1;
		if (response.data.page == 1) {
			filteredImages = [...response.data.items];
			loadingImages = false;
		} else {
			filteredImages = [...filteredImages, ...response.data.items];
			loadingMoreImages = false;
		}
	};

	const _loadFirstPage = async () => {
		getImages().then(handleResponse);
	};

	const loadFirstPage = debounce(_loadFirstPage, 200);

	const loadNextPage = async () => {
		if (loadingMoreImages) return;
		if (nextPage < 0) return;
		loadingMoreImages = true;
		getImages(nextPage).then(handleResponse);
	};

	$: {
		if (browser) {
			// entityFilter && showPCs; //to trigger reactivity
			loadingImages = true;
			loadFirstPage();
		}
	}

	let handleScroll = async (e: Event) => {
		console.log('scroll');
		if (imageDiv.scrollTop + imageDiv.clientHeight == imageDiv.scrollHeight) {
			await loadNextPage();
		}
	};
	onMount(() => {
		infiniteScroll(loadNextPage, observerRow);
	});

	// {#if filteredImages}
	// 	<Table.Root>
	// 		<Table.Caption>
	// 			<Pagination.Root count={numResults} {perPage} {siblingCount} let:pages let:currentPage>
	// 				<Pagination.Content>
	// 					<Pagination.Item>
	// 						<Pagination.PrevButton
	// 							on:click={() => {
	// 								if (!currentPage || currentPage == 1) return;
	// 								getImages(currentPage - 1).then((response) => {
	// 									if (!response.data) return;
	// 									filteredImages = response.data.items;
	// 								});
	// 							}}
	// 						>
	// 							<ChevronLeft class="h-4 w-4" />
	// 							<span class="hidden sm:block">Previous</span>
	// 						</Pagination.PrevButton>
	// 					</Pagination.Item>
	// 					{#each pages as page (page.key)}
	// 						{#if page.type === 'ellipsis'}
	// 							<Pagination.Item>
	// 								<Pagination.Ellipsis />
	// 							</Pagination.Item>
	// 						{:else}
	// 							<Pagination.Item>
	// 								<Pagination.Link
	// 									{page}
	// 									isActive={currentPage == page.value}
	// 									on:click={() => {
	// 										getImages(page.value).then((response) => {
	// 											if (!response.data) return;
	// 											filteredImages = response.data.items;
	// 										});
	// 									}}
	// 								>
	// 									{page.value}
	// 								</Pagination.Link>
	// 							</Pagination.Item>
	// 						{/if}
	// 					{/each}
	// 					<Pagination.Item>
	// 						<Pagination.NextButton
	// 							on:click={() => {
	// 								if (!currentPage) return;
	// 								getImages(currentPage + 1).then((response) => {
	// 									if (!response.data) return;
	// 									filteredImages = response.data.items;
	// 								});
	// 							}}
	// 						>
	// 							<span class="hidden sm:block">Next</span>
	// 							<ChevronRight class="h-4 w-4" />
	// 						</Pagination.NextButton>
	// 					</Pagination.Item>
	// 				</Pagination.Content>
	// 			</Pagination.Root>
	// 		</Table.Caption>
	// 		<Table.Header>
	// 			<Table.Row>
	// 				<Table.Head>ID</Table.Head>
	// 				<Table.Head>Image Name</Table.Head>
	// 				<Table.Head>Tags</Table.Head>
	// 				<Table.Head>Dimensions</Table.Head>
	// 				<Table.Head>Type</Table.Head>
	// 			</Table.Row>
	// 		</Table.Header>
	// 		<Table.Body>
	// 			{#each filteredImages as image (image.image_id)}
	// 				<Table.Row>
	// 					<Table.Cell>{image.image_id}</Table.Cell>
	// 					<Table.Cell>{image.name}</Table.Cell>
	// 					<Table.Cell>{image.tags.map((t) => capitalise(t.tag)).join(', ')}</Table.Cell>
	// 					<Table.Cell>{image.dimension_x} x {image.dimension_y}</Table.Cell>
	// 					<Table.Cell>{image.type}</Table.Cell>
	// 				</Table.Row>
	// 			{/each}
	// 		</Table.Body>
	// 	</Table.Root>
	// 	<!-- <div class="entitylist" bind:this={imageDiv} on:scroll={handleScroll}>
	// 		{#if loadingImages}
	// 			Loading...
	// 		{:else}
	// 			{#each filteredImages as image (image.image_id)}
	// 				<div>
	// 					{image.name}
	// 				</div>
	// 			{:else}
	// 				No entities.
	// 			{/each}
	// 			{#if loadingMoreImages}
	// 				loading...
	// 			{:else}
	// 				<tr bind:this={observerRow} />
	// 			{/if}
	// 		{/if}
	// 	</div> -->
	// {:else}
	// 	<tr><td>Loading images...</td></tr>
	// {/if}
	// <!-- </table> -->
</script>

<div class="container mx-auto py-10">
	<DataTable />
</div>
