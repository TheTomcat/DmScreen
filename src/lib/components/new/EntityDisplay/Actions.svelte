<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { type ExtText, findCost, parseNameForConsumable, createIDStem } from '$lib/jsonschema';
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
	export let actions: ExtText[];
	export let participant: Participant | undefined;
	export let legendary: boolean = false;
	// 	participant_id: Math.floor(Math.random() * 50),
	// 	combat_id: 3
	// } as Participant;
</script>

<!-- svelte-ignore empty-block
{#if participant && legendary && createCounter(participant, 'legendary-actions', 'Legendary Actions', 3, 0, 'turn')}{/if} -->
{#if actions}
	<!-- svelte-ignore empty-block -->
	{#each actions as action}
		<div class="flex items-center">
			{#if participant && legendary}
				{@const cost = findCost(action.name) || 1}
				<Button
					class="h-[unset] pr-2 py-1 m-1 -ml-2 pl-2"
					variant="outline"
					disabled={remaining(
						$counters.find(findCounter(participant, createIDStem(['legendary-actions'])))
					) < cost}
					on:click={() => {
						if (!participant) return;
						consumeByParticipant(
							participant,
							createIDStem(['legendary-actions']),
							findCost(action.name)
						);
					}}
				>
					<h3 class="flex text-lg italic items-center underline decoration-dashed">
						<TextBlock text={action.name} />
					</h3>
				</Button>
			{:else if participant && action.name.includes('Legendary Resistance')}
				{@const { id, qty } = parseNameForConsumable(action.name) || { id: '', qty: 0 }}
				<h3 class="flex text-lg italic items-center">
					<Button
						variant="outline"
						class="h-[unset] pr-2 py-1 m-1 -ml-2 pl-2"
						disabled={isEmpty($counters.find(findCounter(participant, id)))}
						on:click={() => {
							if (!participant) return;
							consumeByParticipant(participant, id);
						}}
					>
						<h3 class="flex text-lg italic items-center underline decoration-dashed">
							<TextBlock text={action.name.split('(')[0]} />
						</h3>
					</Button>

					(<Counter
						id={makeCounterID(participant, createIDStem(['legendary-resistance']))}
						abbreviated={true}
					/>/{action.name.split('(')[1].split('/')[1]}
				</h3>
			{:else if participant && parseNameForConsumable(action.name)}
				{@const { id, qty } = parseNameForConsumable(action.name) || { id: '', qty: 0 }}
				<Button
					variant="outline"
					class="h-[unset] pr-2 py-1 m-1 -ml-2 pl-2"
					disabled={isEmpty($counters.find(findCounter(participant, id)))}
					on:click={() => {
						if (!participant) return;
						consumeByParticipant(participant, id);
					}}
				>
					<h3 class="flex text-lg italic items-center underline decoration-dashed">
						<TextBlock text={action.name} />
					</h3>
				</Button>

				<!-- <h3 class="flex text-lg italic items-center">
					
				</h3> -->
				<Counter id={makeCounterID(participant, id)} abbreviated={true} />
			{:else}
				<h3 class="flex text-lg italic items-center">
					<TextBlock text={action.name} />
				</h3>
			{/if}

			{#if participant && parseNameForConsumable(action.name)}
				{@const { id, qty } = parseNameForConsumable(action.name) || { id: '', qty: 0 }}
				<!-- <Button
					class="h-[unset] px-2 py-1 m-1"
					disabled={isEmpty($counters.find(findCounter(participant, id)))}
					on:click={() => {
						if (!participant) return;
						consumeByParticipant(participant, id);
					}}
				>
					Consume
				</Button> -->
				<Button
					class="h-[unset] px-2 py-1 mx-2 "
					disabled={isFull($counters.find(findCounter(participant, id)))}
					on:click={() => {
						if (!participant) return;
						resetByParticipant(participant, id);
					}}
				>
					Reset
				</Button>
			{/if}
		</div>
		<div class="pl-4">
			{#each action.entries as entry}
				{#if typeof entry == 'string'}
					<p><TextBlock text={entry} /></p>
				{:else}
					<ListEntry listEntry={entry} />
				{/if}
			{/each}
		</div>
	{/each}
{/if}

<style>
	button.naked {
		padding: unset;
		/* border: unset; */
		color: unset;
	}
</style>
