<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Textarea } from '$lib/components/ui/textarea';
	import * as Popover from '$lib/components/ui/popover';
	import type {
		ExtText,
		findCost,
		parseNameForConsumable,
		createIDStem,
		ListEntry as LstEntry
	} from '$lib/jsonschema';
	import {
		consumeByParticipant,
		createCounter,
		makeCounterID,
		resetByParticipant,
		counters,
		isEmpty,
		findCounter,
		isFull,
		remaining,
		findCountersByParticipant
	} from '$lib/stores/counterStore';
	import type { Participant } from '../../../../app';
	import Counter from './Counter.svelte';
	import ListEntry from './ListEntry.svelte';
	import TextBlock from './TextBlock.svelte';

	import { Input } from '$lib/components/ui/input';
	import { MoreVertical, PlusCircle, Trash2 } from 'lucide-svelte';
	export let actions: ExtText[];

	const addText = () => {
		actions = [...actions, { name: '', entries: [''] }];
	};
	const addList = () => {
		actions = [...actions, { name: '', entries: [{ type: 'list', style: '', items: [] }] }];
	};

	const newEntry = (type: 'string' | 'list'): LstEntry | string => {
		if (type === 'string') {
			return '';
		} else {
			return { type: 'list', style: '', items: [] };
		}
	};

	const addEntry = (i: number, type: 'string' | 'list') => {
		return () => {
			actions = actions.with(
				i,
				// actions = [
				// ...actions.slice(0, i),
				{ name: actions[i].name, entries: [...actions[i].entries, newEntry(type)] }
				// ...actions.slice(i + 1)
				// ];
			);
		};
	};

	const removeEntry = (i: number, j: number) => {
		return () => {
			actions = actions.with(i, {
				name: actions[i].name,
				entries: [...actions[i].entries.slice(0, j), ...actions[i].entries.slice(j + 1)]
			});
		};
	};

	const removeAction = (i: number) => {
		return () => {
			actions = [...actions.slice(0, i), ...actions.slice(i + 1)];
		};
	};

	const addAction = () => {
		actions = [...actions, { name: '', entries: [] }];
	};
</script>

<!-- svelte-ignore empty-block
{#if participant && legendary && createCounter(participant, 'legendary-actions', 'Legendary Actions', 3, 0, 'turn')}{/if} -->
{#if actions}
	<!-- svelte-ignore empty-block -->
	{#each actions as action, i}
		<div class="border rounded-lg p-4">
			<div class="flex items-center">
				<h3 class="flex text-lg italic items-between">
					<Input bind:value={action.name} class="w-[300px]" />
					<Button on:click={removeAction(i)}><Trash2 /></Button>
				</h3>
			</div>
			<div class="pl-5 ml-3 grid gap-2 border-l-2 border-gray-200">
				{#each action.entries as entry, j}
					<div class="grid grid-cols-[1fr_auto] items-center">
						{#if typeof entry == 'string'}
							<Textarea bind:value={entry} />
							<Button on:click={removeEntry(i, j)}><Trash2 /></Button>
						{:else}
							<ListEntry listEntry={entry} />
						{/if}
					</div>
				{/each}
			</div>
			<div class="flex w-full justify-end">
				<Popover.Root portal={null}>
					<Popover.Trigger asChild let:builder>
						<Button variant="outline" builders={[builder]}
							><PlusCircle class="h-4 w-4" />New Row</Button
						>
					</Popover.Trigger>
					<Popover.Content class="w-80">
						<div class="grid gap-4">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">New Row</h4>
								<p class="text-sm text-muted-foreground">Select a Type</p>
							</div>
							<div class="grid gap-2">
								<div class="grid grid-cols-3 items-center gap-4">
									<Button
										id="width"
										value="100%"
										class="col-span-2 h-8"
										on:click={addEntry(i, 'string')}>Simple Text</Button
									>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<Button
										id="width"
										value="100%"
										class="col-span-2 h-8"
										on:click={addEntry(i, 'list')}>List</Button
									>
								</div>
							</div>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	{/each}
	<Button on:click={addAction}><PlusCircle class="h-4 w-4" />Add Action</Button>
	{JSON.stringify(actions)}
{/if}
