<script lang="ts">
	import {
		Check,
		ChevronsUpDown,
		Cross,
		GalleryHorizontalEnd,
		Loader,
		PlusCircle,
		X
	} from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';

	import { Button } from '$lib/components/ui/button';
	import type { Collection } from '../../../app';
	import { browser } from '$app/environment';
	import { debounce, debounce2 } from '$lib';
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import client from '$lib/api/index';
	import { cn } from '$lib/utils';
	import Separator from '../ui/separator/separator.svelte';

	let dispatch = createEventDispatcher<{
		newCollection: undefined;
	}>();

	let open: boolean;
	let value: string = '';
	let prevValue: string = '';
	let allCollections: Collection[] = [];
	export let currentCollection: Collection | undefined;
	export let allowNew: boolean = false;
	let className: string | undefined | null = undefined;
	export { className as class };

	const fetchCollectionsFromServer = async (
		page: number,
		size: number,
		name: string = ''
		// clearCollections: boolean = false
	) => {
		// TODO: Type this properly
		return client
			.GET('/collection/', { params: { query: { size, page, name } } })
			.then((response) => {
				console.log(response);
				if (!response.data) return;
				// if (clearCollections)
				// allCollections = [];
				allCollections = response.data.items;
				// console.log(allTags);
				// if ((response.data.page || 1) < (response.data.pages || 1)) {
				// 	return _getCollections(page + 1, size);
				// }
			});
	};

	const updateCollectionsBasedOnInput = () => {
		// let first =
		// 	value.toLocaleLowerCase().includes(prevValue.toLocaleLowerCase()) &&
		// 	allCollections.length > 0;
		// console.log(value, prevValue, allCollections.length, first);
		if (
			value.toLocaleLowerCase().includes(prevValue.toLocaleLowerCase()) &&
			allCollections.length > 0
		) {
			allCollections = allCollections.filter((c) =>
				c.name.toLocaleLowerCase().includes(value.toLocaleLowerCase())
			);
			prevValue = value;
		} else {
			fetchCollectionsFromServer(1, 20, value);
			prevValue = value;
		}
	};

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	onMount(() => {
		fetchCollectionsFromServer(1, 20, '');
	});

	const { fn: getCollections, isLoading } = debounce2(updateCollectionsBasedOnInput, 200);

	$: selectedValue = allCollections.find((c) => c.name === value)?.name ?? 'Select a collection...';
	$: {
		if (browser) {
			value;
			getCollections();
		}
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class={cn('w-[200px] justify-between', className)}
		>
			{selectedValue}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class={cn('w-[200px] p-0', className)}>
		<Command.Root>
			<div class="flex flex-row items-center">
				<Command.Input placeholder="Search collections..." bind:value />
				<Button
					variant="ghost"
					class="m-0 p-0 border-b h-[45px] rounded-none"
					on:click={() => {
						value = '';
						open = false;
					}}
				>
					<X class="mr-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</div>
			<Command.List>
				<Command.Empty>No collection found.</Command.Empty>
				<Command.Group>
					{#if $isLoading}
						<Command.Item disabled><Loader class="spin w-4 h-4 mr-1" />Loading</Command.Item>
					{:else}
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
					{/if}
				</Command.Group>
			</Command.List>
			{#if allowNew}
				<Separator />
				<Command.Item>
					<Button
						variant="ghost"
						on:click={() => {
							dispatch('newCollection');
							open = false;
						}}
					>
						<PlusCircle class="h-4 w-4 mr-2" />Create New Collection
					</Button>
				</Command.Item>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>
