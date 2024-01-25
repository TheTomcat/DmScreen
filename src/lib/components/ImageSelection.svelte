<script lang="ts">
	import client from '$lib/api/index';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Collection } from '../../app';
	import { createEventDispatcher, onMount } from 'svelte';

	import { Check, ChevronsUpDown, GalleryHorizontalEnd } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';

	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';
	import { capitalise, debounce } from '$lib';
	import { browser } from '$app/environment';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut, quintInOut } from 'svelte/easing';
	import type { wsImageData } from '$lib/ws';
	import ImageGallery from './ImageGallery.svelte';

	import { flip } from 'svelte/animate';

	export let selectSingleImage: boolean = false;

	const dispatch = createEventDispatcher<{
		selection:
			| { imageData: Collection; collection: true }
			| { imageData: number; collection: false };
	}>();

	let open = false;
	let value = '';

	let tabvalue = 'search';

	let allCollections: Collection[] = [];
	let currentCollection: Collection | undefined;

	type CollectionResponse = Promise<
		| {
				data:
					| {
							items: Collection[] | undefined;
							page: number | undefined;
							size: number | undefined;
							pages: number | undefined;
							total: number | undefined;
					  }
					| undefined;
				response: Response;
		  }
		| undefined
	>;

	const _getCollections = async (
		page: number,
		size: number,
		name: string = '',
		clearCollections: boolean = false
	): CollectionResponse => {
		// TODO: Type this properly
		return client
			.GET('/collection/', { params: { query: { size, page, name } } })
			.then((response) => {
				console.log(response);
				if (!response.data) return;
				// if (clearCollections)
				allCollections = [];
				allCollections = [...allCollections, ...response.data.items];
				// console.log(allTags);
				if ((response.data.page || 1) < (response.data.pages || 1)) {
					return _getCollections(page + 1, size);
				}
			});
	};

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	onMount(() => {
		_getCollections(1, 100).then(() => {
			console.log(allCollections);
		});
	});

	const getCollections = debounce(_getCollections, 100);

	$: selectedValue = allCollections.find((c) => c.name === value)?.name ?? 'Select a collection...';
	$: {
		if (browser) {
			value;
			_getCollections(1, 20, value, true);
		}
	}

	const tabs = ['search', 'collection'];
	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<Tabs.Root bind:value={tabvalue}>
	<Tabs.List class="grid w-full grid-cols-2">
		{#each tabs as tab, index (index)}
			{@const isActive = tab === tabvalue}
			<Tabs.Trigger
				value={tab}
				class={cn(
					'relative flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors bg-[unset] hover:text-primary',
					isActive ? 'font-medium text-primary' : 'text-muted-foreground'
				)}
			>
				{#if isActive}
					<div
						class="absolute inset-0 rounded-full bg-slate-800"
						in:send={{ key: 'activetab' }}
						out:receive={{ key: 'activetab' }}
					/>
				{/if}
				<div class="relative">
					{capitalise(tab)}
				</div>
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	<Tabs.Content value="search">
		<Card.Root class="cursor-default">
			<Card.Header>
				<Card.Title>Image Search</Card.Title>
				<Card.Description>Search for an image to display</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2 @container">
				<ImageGallery small={true}>
					<div
						slot="gallery"
						let:galleryItems
						class="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-4"
					>
						{#if galleryItems}
							{#each galleryItems as image (image.image_id)}
								<button
									class="dark:bg-slate-900 rounded-md overflow-hidden hover:scale-110 hover:transition-all transition-all"
									animate:flip={{ duration: 500, easing: quintInOut }}
									on:click={() =>
										dispatch('selection', { imageData: image.image_id, collection: false })}
								>
									<img
										class="portrait"
										src={`/api/${image.thumbnail_url}?width=240`}
										alt={image.name}
										width={image.dimension_x}
										height={image.dimension_y}
									/></button
								>
							{/each}
						{/if}
					</div>
				</ImageGallery>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="collection">
		<Card.Root class="cursor-default">
			<Card.Header>
				<Card.Title>Collection</Card.Title>
				<Card.Description>Select a scene to display images</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2 @container">
				<div class="flex flex-row items-center justify-between">
					<Popover.Root bind:open let:ids>
						<Popover.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								role="combobox"
								aria-expanded={open}
								class="w-[200px] justify-between"
							>
								{selectedValue}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-[200px] p-0">
							<Command.Root>
								<Command.Input placeholder="Search collections..." />
								<Command.Empty>No collection found.</Command.Empty>
								<Command.Group>
									{#each allCollections as collection}
										<Command.Item
											value={collection.name}
											onSelect={(currentValue) => {
												value = currentValue;
												currentCollection = allCollections.find(
													(c) => c.name.toLocaleLowerCase() == currentValue.toLocaleLowerCase()
												);
												closeAndFocusTrigger(ids.trigger);
											}}
										>
											<Check
												class={cn('mr-2 h-4 w-4', value !== collection.name && 'text-transparent')}
											/>
											{collection.name}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
					{#if currentCollection && !selectSingleImage}
						<Tooltip.Root>
							<Tooltip.Trigger asChild let:builder>
								<Button
									variant="outline"
									builders={[builder]}
									on:click={() => {
										if (!currentCollection) return;
										dispatch('selection', { imageData: currentCollection, collection: true });
									}}
								>
									<GalleryHorizontalEnd class="w-4 h-4 mr-1" />
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>Select entire collection</Tooltip.Content>
						</Tooltip.Root>
					{/if}
				</div>
				{#if currentCollection}
					<div class="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-4">
						{#each currentCollection.images as image}
							<button
								class="dark:bg-slate-900 rounded-md overflow-hidden hover:scale-110 hover:transition-all transition-all"
								on:click={(e) =>
									dispatch('selection', { imageData: image.image_id, collection: false })}
							>
								<img src={`/api/${image.thumbnail_url}`} alt={image.name} />
							</button>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
	<!-- <Tabs.Content value="favourites">
		<Card.Root class="cursor-default">
			<Card.Header>
				<Card.Title>Password</Card.Title>
				<Card.Description>
					Change your password here. After saving, you'll be logged out.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="space-y-1">
					<Label for="current">Current password</Label>
					<Input id="current" type="password" />
				</div>
				<div class="space-y-1">
					<Label for="new">New password</Label>
					<Input id="new" type="password" />
				</div>
			</Card.Content>
			<Card.Footer>
				<Button>Save password</Button>
			</Card.Footer>
		</Card.Root>
	</Tabs.Content> -->
</Tabs.Root>
