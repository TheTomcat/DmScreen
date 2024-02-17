<script lang="ts">
	import { Input } from '$lib/components/ui/input';

	import type { TableViewModel } from 'svelte-headless-table';
	import { Button } from '$lib/components/ui/button';
	import { Cross } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import type { Message } from '../../../../app';

	export let tableModel: TableViewModel<Message, any>;
	export let selection: Writable<number[]>;

	import { plural } from '$lib';

	const { pluginStates } = tableModel;
	const {
		filterValue
	}: {
		filterValue: Writable<string>;
	} = pluginStates.filter;

	$: showReset = Object.values({ $filterValue }).some((v) => v.length > 0);
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input placeholder="Search..." class="h-8 w-[70%]" type="search" bind:value={$filterValue} />

		{#if showReset}
			<Button
				on:click={() => {
					$filterValue = '';
				}}
				variant="ghost"
				class="h-8 px-2 lg:px-3"
			>
				Reset
				<Cross class="ml-2 h-4 w-4" />
			</Button>
		{/if}
	</div>
	<div class="flex-1 text-sm text-muted-foreground text-right">
		{$selection.length}
		{plural($selection.length, 'message')} selected.
	</div>
</div>
