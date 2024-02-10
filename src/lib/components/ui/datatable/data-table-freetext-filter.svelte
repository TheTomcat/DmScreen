<script lang="ts">
	import { PlusCircle, Check, Search, Filter } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';

	import type { selectType } from './data-table';
	import type { Writable } from 'svelte/store';
	// import type { imageTypes } from './data';

	export let title: string;
	// export let options: Writable<selectType[]> = []; //as typeof imageTypes;
	export let options: string[] = [];
	let value: string;

	let open = false;

	const handleSelect = (currentValue: string) => {
		options = options.filter((o) => o.toLocaleLowerCase() !== currentValue.toLocaleLowerCase());
		// if (Array.isArray(filterValues) && filterValues.includes(currentValue)) {
		// 	filterValues = filterValues.filter((v) => v !== currentValue);
		// } else {
		// 	filterValues = [...(Array.isArray(filterValues) ? filterValues : []), currentValue];
		// }
	};
	const handleKeypress = (e: KeyboardEvent) => {
		if (e.key == 'Enter') {
			options = [...options, value];
			value = '';
			e.stopPropagation();
			// options = [...(Array.isArray(options) ? options : []), value];
			// open = false;
		} else if (e.key == 'Escape') {
			open = false;
		} else {
		}
	};
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="sm" class="h-8 border-dashed">
			<Filter class="mr-2 h-4 w-4" />
			{title}

			{#if options.length > 0}
				<Separator orientation="vertical" class="mx-2 h-4" />
				<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
					{options.length}
				</Badge>
				<div class="hidden space-x-1 lg:flex">
					{#if options.length > 2}
						<Badge variant="secondary" class="rounded-sm px-1 font-normal">
							{options.length} Selected
						</Badge>
					{:else}
						{#each options as option}
							<Badge variant="secondary" class="rounded-sm px-1 font-normal">
								{option}
							</Badge>
						{/each}
					{/if}
				</div>
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0" align="start" side="bottom">
		<Command.Root>
			<div class="flex items-center border-b px-2" data-cmdk-input-wrapper="">
				<Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
				<input
					bind:value
					on:keydown={handleKeypress}
					class={cn(
						'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
					)}
				/>
			</div>

			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item value={option} onSelect={handleSelect}>
							<div
								class={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									true ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check className={cn('h-4 w-4')} />
							</div>
							<span>
								{option}
							</span>
						</Command.Item>
					{/each}
				</Command.Group>
				{#if options.length > 0}
					<Command.Separator />
					<Command.Item
						class="justify-center text-center"
						onSelect={() => {
							options = [];
						}}
					>
						Clear filters
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
