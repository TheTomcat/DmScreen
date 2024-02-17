<script lang="ts">
	import { ArrowDown, ArrowUp, ArrowDownUp } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	let className: string | undefined | null = undefined;
	export { className as class };
	export let props: {
		select: never;
		sort: {
			order: 'desc' | 'asc' | undefined;
			toggle: (event: Event) => void;
			clear: () => void;
			disabled: boolean;
		};
		filter: never;
	};

	function handleAscSort(e: Event) {
		if (props.sort.order === 'asc') {
			return;
		}
		props.sort.toggle(e);
	}

	function handleDescSort(e: Event) {
		if (props.sort.order === 'desc') {
			return;
		}
		props.sort.toggle(e);
	}

	function handleSort(e: Event) {
		props.sort.toggle(e);
	}
</script>

{#if false}
	{#if !props.sort.disabled}
		<div class={cn('flex items-center', className)}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						variant="ghost"
						builders={[builder]}
						class="-ml-3 h-8 data-[state=open]:bg-accent"
					>
						<slot />
						{#if props.sort.order === 'desc'}
							<ArrowUp class="ml-2 h-4 w-4 text-white" />
						{:else if props.sort.order === 'asc'}
							<ArrowDown class="ml-2 h-4 w-4 text-white" />
						{:else}
							<ArrowDownUp class="ml-2 h-4 w-4" />
						{/if}
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.Item on:click={handleAscSort}>Asc</DropdownMenu.Item>
					<DropdownMenu.Item on:click={handleDescSort}>Desc</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{:else}
		<slot />
	{/if}
{:else}
	<div class={cn('flex items-center', className)}>
		<Button variant="ghost" class="-ml-3 h-8 data-[state=open]:bg-accent" on:click={handleSort}>
			<slot />
			{#if props.sort.order === 'desc'}
				<ArrowUp class="ml-2 h-4 w-4 text-white" />
			{:else if props.sort.order === 'asc'}
				<ArrowDown class="ml-2 h-4 w-4 text-white" />
			{:else}
				<ArrowDownUp class="ml-2 h-4 w-4" />
			{/if}
		</Button>
	</div>
{/if}
