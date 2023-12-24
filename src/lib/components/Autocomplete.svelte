<script lang="ts">
	import { debounce } from '$lib';

	type T = $$Generic;
	// import AutocompleteItem from './AutocompleteItem.svelte';
	import { createEventDispatcher } from 'svelte';
	/**
	 * The list of items provided to the autocomplete component.
	 */
	export let allItems: T[] | undefined = undefined;
	/**
	 * A function to return a list of items based on a search query.
	 */
	export let getData: ((q: string) => Promise<T[]>) | undefined = undefined;
	/**
	 * Placeholder string to display on the input field
	 */
	export let placeholder: string = '';
	/**
	 * Function taking an element and returning the display value
	 * (item: T) => string
	 */
	export let extractName: (item: T) => string;
	/**
	 * Function taking an element and returning the display value
	 * (item: T) => ID (string | number)
	 */
	export let extractId: (item: T) => string | number;
	export let debounceTime: number = 400;
	export let useCache: boolean = false;

	/**
	 * Confine the autocomplete field to only display pre-set values, or allow the creation of new ones.
	 */
	export let allowCreation: boolean = false;

	let cache: { [query: string]: T[] } = {};
	let mostRecentSearch: string = '';
	let inFlight: number = 0;

	if ((allItems === undefined) == (getData === undefined)) {
		console.error('Must supply one of either allItems or getData, but not both.');
	}

	/* HANDLING THE INPUT */
	export let searchInput: HTMLElement | undefined = undefined; // use with bind:this to focus element
	let inputValue = ''; //bound to the value of the input element

	const dispatch = createEventDispatcher<{
		submititem: T;
		submitnew: { value: string };
		emptysubmit: undefined;
	}>();

	let filteredItems: T[] = [];

	$: if (!inputValue) {
		filteredItems = [];
		currentIndex = -1;
	}

	const sortFunction = (a: T, b: T): number => {
		return extractName(a).length - extractName(b).length; //score(b, query) - score(a, query);
	};

	const cachedGetData = async (query: string) => {
		if (!getData) return [];
		inFlight += 1;
		if (query === '') return [];
		if (useCache) {
			if (query in cache) {
				return cache[query];
			}
			let val = await getData(query);
			cache[query] = val;
			return val;
		} else {
			return getData(query);
		}
	};

	const _filterItems = async () => {
		if (getData) {
			mostRecentSearch = inputValue;
			cachedGetData(inputValue).then((response) => {
				inFlight -= 1;
				if (mostRecentSearch == inputValue) {
					filteredItems = response.toSorted(sortFunction);
					currentIndex = 0;
				}
			});
		}
		if (allItems)
			filteredItems = allItems.filter((item) =>
				extractName(item).toLowerCase().includes(inputValue.toLowerCase())
			);
		if (filteredItems.length === 1) {
			currentIndex = 0;
		}
	};

	const filterItems = debounce(_filterItems, debounceTime);

	const clearInput = () => {
		inputValue = '';
		currentIndex = -1;
		searchInput?.focus();
	};

	const makeMatchBold = (text: string) => {
		let startPosition = text.toLowerCase().indexOf(inputValue.toLowerCase());
		if (startPosition === -1) return text;
		let prefix = text.substring(0, startPosition);
		let infix = text.substring(startPosition, startPosition + inputValue.length); //Do this to preserve case
		let suffix = text.substring(startPosition + inputValue.length);

		return `${prefix}<strong>${infix}</strong>${suffix}`;
	};

	let currentIndex: number = -1;
	$: currentData = currentIndex ? filteredItems[currentIndex] : null;

	const processKeyStroke = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown' && currentIndex <= filteredItems.length - 1) {
			currentIndex === filteredItems.length - 1 ? (currentIndex = 0) : (currentIndex += 1);
			e.preventDefault();
		} else if (e.key === 'ArrowUp' && currentIndex >= 0) {
			currentIndex === 0 ? (currentIndex = filteredItems.length - 1) : (currentIndex -= 1);
			e.preventDefault();
		} else if (e.key === 'Enter' && currentIndex >= 0 && filteredItems.length > 0) {
			// console.log(`Enter: Cix ${filteredItems}`);
			submitExistingData(filteredItems[currentIndex]);
			e.preventDefault();
		} else if (e.key === 'Escape') {
			currentIndex = -1;
			filteredItems = [];
		} else if (e.key === 'Enter' && inputValue) {
			// console.log('Enter');
			submitUnknownData(inputValue);
			e.preventDefault();
		} else if (e.key === 'Enter') {
			dispatch('emptysubmit');
			e.preventDefault();
		} else if (filterItems.length > 0) {
			currentIndex = 0;
		} else {
			currentIndex = -1;
			return;
		}
	};

	const submitExistingData = (item: T | string) => {
		if (typeof item === 'string') {
			dispatch('submitnew', { value: item });
		} else {
			dispatch('submititem', { ...item });
		}
		filteredItems = [];
		currentIndex = -1;
		clearInput();
	};

	const submitUnknownData = (data: T | string) => {
		if (typeof data == 'string') {
			// try to find a matching item
			if (inFlight > 0) console.log('uh oh');
			let match = filteredItems.find((item) => extractName(item) == data);
			if (match) {
				data = match;
			} else if (!allowCreation) {
				return;
			}
		}
		submitExistingData(data);
	};
</script>

<svelte:window on:keydown={processKeyStroke} />

<!-- <form autocomplete="off" on:submit|preventDefault={handleFormSubmit}> -->
<div class="container">
	<div class="autocomplete">
		<input
			type="text"
			{placeholder}
			autocomplete="off"
			data-form-type="other"
			bind:this={searchInput}
			bind:value={inputValue}
			on:input={filterItems}
			on:blur={() => {
				filteredItems = [];
			}}
		/>
	</div>

	{#if filteredItems.length > 0}
		<ul id="autocomplete-items-list">
			{#each filteredItems as itemData, i (extractId(itemData))}
				<li class="autocomplete-items" class:autocomplete-active={i === currentIndex}>
					<div
						role="button"
						tabindex="0"
						on:mousedown={(e) => {
							submitExistingData(itemData);
						}}
						on:keydown={() => submitExistingData(itemData)}
					>
						{@html makeMatchBold(extractName(itemData))}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<!-- </form> -->

<style>
	.container {
		position: relative;
	}
	div.autocomplete {
		/*the container must be positioned relative:*/
		position: relative;
		display: inline-block;
		width: 100%;
	}
	input {
		border: 1px solid transparent;
		background-color: var(--surface-4);
		padding: var(--size-3);
		margin: 0;
	}
	input[type='text'] {
		background-color: var(--surface-4);
		width: 100%;
	}
	#autocomplete-items-list {
		position: absolute;
		margin: 0;
		padding: 0;
		z-index: 900;
		width: 100%;
		border: 1px solid var(--border);
		background-color: var(--surface-4);
	}
	.autocomplete-items {
		list-style: none;
		border-bottom: 1px solid var(--border);
		/* z-index: 99;
		top: 100%;
		left: 0;
		right: 0; */
		text-align: left;
		padding: 10px;
		cursor: pointer;
		background-color: var(--surface-4);
		max-inline-size: unset;
	}

	.autocomplete-items:hover {
		/*when hovering an item:*/
		background-color: #81921f;
		color: white;
	}

	.autocomplete-items:active {
		/*when navigating through the items using the arrow keys:*/
		background-color: DodgerBlue !important;
		color: #ffffff;
	}

	.autocomplete-active {
		/*when navigating through the items using the arrow keys:*/
		background-color: DodgerBlue !important;
		color: #ffffff;
	}
</style>
