<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';

	import type { AnyPlugins } from 'svelte-headless-table/plugins';
	import type { TableViewModel } from 'svelte-headless-table';

	export let tableModel: TableViewModel<any, AnyPlugins>;
	export let small: boolean = false;

	const { pageRows, pluginStates, rows } = tableModel;

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;

	const { selectedDataIds } = pluginStates.select;
</script>

{#if small}
	<div class="flex justify-between">
		<div class="flex gap-2">
			<Button
				variant="outline"
				class="hidden h-8 w-8 p-0 lg:flex"
				on:click={() => ($pageIndex = 0)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to first page</span>
				<ChevronsLeft size={15} />
			</Button>
			<Button
				variant="outline"
				class="p-0 w-8 h-8"
				on:click={() => ($pageIndex = $pageIndex - 1)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to previous page</span>
				<ChevronLeft size={15} />
			</Button>
		</div>
		<div class="flex gap-2">
			{$pageIndex + 1} of {$pageCount}
		</div>
		<div class="flex gap-2">
			<Button
				variant="outline"
				class="p-0 w-8 h-8"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = $pageIndex + 1)}
			>
				<span class="sr-only">Go to next page</span>
				<ChevronRight size={15} />
			</Button>
			<Button
				variant="outline"
				class="hidden h-8 w-8 p-0 lg:flex"
				disabled={!$hasNextPage}
				on:click={(/*Math.ceil($rows.length / $pageRows.length) - 1)*/) =>
					($pageIndex = $pageCount - 1)}
			>
				<span class="sr-only">Go to last page</span>
				<ChevronsRight size={15} />
			</Button>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-between px-2">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} of{' '}
			{$rows.length} row(s) selected.
		</div>
		<div class="flex items-center space-x-6 lg:space-x-8">
			<div class="flex items-center space-x-2">
				<p class="text-sm font-medium">Rows per page</p>
				<Select.Root
					onSelectedChange={(selected) => pageSize.set(Number(selected?.value))}
					selected={{ value: 20, label: '20' }}
				>
					<Select.Trigger class="w-[180px]">
						<Select.Value placeholder="Select page size" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="10">10</Select.Item>
						<Select.Item value="20">20</Select.Item>
						<Select.Item value="30">30</Select.Item>
						<Select.Item value="40">40</Select.Item>
						<Select.Item value="50">50</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-[100px] items-center justify-center text-sm font-medium">
				Page {$pageIndex + 1} of {$pageCount}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					class="hidden h-8 w-8 p-0 lg:flex"
					on:click={() => ($pageIndex = 0)}
					disabled={!$hasPreviousPage}
				>
					<span class="sr-only">Go to first page</span>
					<ChevronsLeft size={15} />
				</Button>
				<Button
					variant="outline"
					class="p-0 w-8 h-8"
					on:click={() => ($pageIndex = $pageIndex - 1)}
					disabled={!$hasPreviousPage}
				>
					<span class="sr-only">Go to previous page</span>
					<ChevronLeft size={15} />
				</Button>
				<Button
					variant="outline"
					class="p-0 w-8 h-8"
					disabled={!$hasNextPage}
					on:click={() => ($pageIndex = $pageIndex + 1)}
				>
					<span class="sr-only">Go to next page</span>
					<ChevronRight size={15} />
				</Button>
				<Button
					variant="outline"
					class="hidden h-8 w-8 p-0 lg:flex"
					disabled={!$hasNextPage}
					on:click={(/*Math.ceil($rows.length / $pageRows.length) - 1)*/) =>
						($pageIndex = $pageCount - 1)}
				>
					<span class="sr-only">Go to last page</span>
					<ChevronsRight size={15} />
				</Button>
			</div>
		</div>
	</div>
{/if}
