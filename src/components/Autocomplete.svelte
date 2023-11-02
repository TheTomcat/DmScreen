<script lang="ts">
	type T = $$Generic;
	import AutocompleteItem from './AutocompleteItem.svelte';
	export let allItems: T[] = [];
	export let placeholder: string = '';
	export let getValue: (item: T) => string;
	export let getID: (item: T) => string | number;
	export let onSubmitCallback: Function;
	export let allowCreation: boolean = false;

	/* HANDLING THE INPUT */
	let searchInput: HTMLElement; // use with bind:this to focus element
	let inputValue = ''; //bound to the value of the input element

	$: if (!inputValue) {
		filteredItems = [];
		currentIndex = -1;
	}

	let filteredItems: T[] = [];

	const filterItems = () => {
		filteredItems = allItems.filter((item) =>
			getValue(item).toLowerCase().includes(inputValue.toLowerCase())
		);
		if (filteredItems.length === 1) {
			currentIndex = 0;
		}
	};

	const clearInput = () => {
		inputValue = '';
		searchInput.focus();
	};

	const makeMatchBold = (text: string) => {
		let startPosition = text.toLowerCase().indexOf(inputValue.toLowerCase());
		if (startPosition === -1) return text;
		let prefix = text.substring(0, startPosition);
		let suffix = text.substring(startPosition + inputValue.length);

		return `${prefix}<strong>${inputValue}</strong>${suffix}`;
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
		} else if (e.key === 'Enter' && currentIndex >= 0) {
			submitExistingData(filteredItems[currentIndex]);
			e.preventDefault();
		} else if (e.key === 'Escape') {
			currentIndex = -1;
			filteredItems = [];
		} else if (e.key === 'Enter') {
			submitUnknownData(inputValue);
			e.preventDefault();
		} else {
			return;
		}
	};

	const submitExistingData = (item: T | string) => {
		onSubmitCallback(item);
		filteredItems = [];
		currentIndex = -1;
		clearInput();
	};

	const submitUnknownData = (data: T | string) => {
		if (typeof data == 'string') {
			// try to find a matching item
			let match = allItems.find((item) => getValue(item) == data);
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
<div class="autocomplete">
	<input
		type="text"
		{placeholder}
		autocomplete="off"
		data-form-type="other"
		bind:this={searchInput}
		bind:value={inputValue}
		on:input={filterItems}
	/>
</div>

{#if filteredItems.length > 0}
	<ul id="autocomplete-items-list">
		{#each filteredItems as itemData, i (getID(itemData))}
			<AutocompleteItem
				itemLabel={makeMatchBold(getValue(itemData))}
				{itemData}
				highlighted={i === currentIndex}
				on:click={() => submitExistingData(itemData)}
			/>
		{/each}
	</ul>
{/if}

<!-- </form> -->

<style>
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
		z-index: 90;
		width: 100%;
		border: 1px solid var(--border);
		background-color: var(--surface-4);
	}
</style>
