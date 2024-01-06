<script lang="ts">
	import type { ExtText } from '$lib/jsonschema';
	import { consumeByParticipant, createCounter, makeCounterID } from '$lib/stores/counterStore';
	import type { Participant } from '../../../../app';
	import Counter from '../Counter.svelte';
	import ListEntry from './ListEntry.svelte';
	import TextBlock from './TextBlock.svelte';
	export let actions: ExtText[];
	export let participant: Participant;
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
		{#if legendary}
			<h5 style="display: flex;">
				<button
					class="naked"
					on:click|preventDefault={() => {
						consumeByParticipant(participant, 'legendary-actions');
					}}
				>
					<TextBlock text={action.name} />
				</button>
			</h5>
		{:else}
			<h5 style="display: flex;">
				{#if participant && action.name.includes('Legendary Resistance')}
					<TextBlock text={action.name.split('(')[0]} />
					&nbsp;(<Counter
						id={makeCounterID(participant, 'legendary-resistance')}
						abbreviated={true}
					/>/{action.name.split('(')[1].split('/')[1]}
				{:else}
					<TextBlock text={action.name} />
				{/if}
			</h5>
		{/if}
		{#each action.entries as entry}
			{#if typeof entry == 'string'}
				<p><TextBlock text={entry} /></p>
			{:else}
				<ListEntry listEntry={entry} />
			{/if}
		{/each}
	{/each}
{/if}

<style>
	button.naked {
		padding: unset;
		/* border: unset; */
		color: unset;
	}
</style>
