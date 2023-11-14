<script lang="ts">
	type T = $$Generic;
	export let itemLabel: string;
	export let itemData: T;
	export let highlighted: boolean;
</script>

<li role="listitem" class="autocomplete-items" class:autocomplete-active={highlighted} on:click>
	{@html itemLabel}
</li>

<style>
	.autocomplete-items {
		list-style: none;
		border-bottom: 1px solid var(--border);
		/* z-index: 99;
		top: 100%;
		left: 0;
		right: 0; */
		padding: 10px;
		cursor: pointer;
		background-color: var(--surface-4);
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
