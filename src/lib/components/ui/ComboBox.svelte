<script lang="ts">
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';

	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	type T = $$Generic;

	export let selectedId: string | undefined = undefined;
	export let selectedItem: T;
	export let allSelections: T[] = [];
	export let extractName: (item: T) => string;
	export let extractId: (item: T) => string;
	// export let showSearch: boolean = false;
	export let placeholder: string = 'Select an option';
	let open: boolean = false;
	let displayText: string;

	const dispatch = createEventDispatcher<{ selection_change: { value: T } }>();

	$: {
		let selectedItem = allSelections.find((c) => extractId(c) === selectedId);
		displayText = selectedItem !== undefined ? extractName(selectedItem) : placeholder;
	}

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-[200px] justify-between"
		>
			{displayText}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<!-- {#if showSearch} -->
			<Command.Input placeholder="Search collections..." />
			<Command.Empty>No collection found.</Command.Empty>
			<!-- {/if} -->
			<Command.Group>
				{#each allSelections as selection}
					<Command.Item
						value={extractId(selection)}
						onSelect={(currentId) => {
							dispatch('selection_change', { value: selection });
							selectedId = currentId;
							closeAndFocusTrigger(ids.trigger);
						}}
					>
						<Check
							class={cn('mr-2 h-4 w-4', selectedId !== extractId(selection) && 'text-transparent')}
						/>
						{extractName(selection)}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
