<script lang="ts">
	import { ordinal } from '$lib';
	import type { SpellLevel, Spellcasting } from '$lib/jsonschema';
	import {
		consume,
		consumeByParticipant,
		counters,
		createCounter,
		findCounter,
		isEmpty,
		makeCounterID
	} from '$lib/stores/counterStore';
	import Counter from '../Counter.svelte';
	import type { Participant } from '../../../../app';
	import TextBlock from './TextBlock.svelte';

	export let spellcastings: Spellcasting[];
	export let participant: Participant;
	// | undefined = {
	// 	participant_id: Math.floor(Math.random() * 50),
	// 	combat_id: 3
	// } as Participant;

	const levels: SpellLevel[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
</script>

<div class="spellcastingcontainer">
	{#if spellcastings}
		{#each spellcastings as spellcasting}
			<h5 class="spellcastingspan">{spellcasting.name} ({spellcasting.ability})</h5>
			<TextBlock text={spellcasting.headerEntries?.join(', ') || ''} />
			<ul>
				{#if 'spells' in spellcasting}
					{#each levels as level}
						<li>
							{#if spellcasting?.spells && level in spellcasting.spells}
								{@const spellblock = spellcasting.spells[level]}
								{#if spellblock}
									{#if level == '0'}
										Cantrips (at will): {spellblock.spells.join(', ') || ''}
									{:else if spellblock.spells}
										<div class="spellblock level">
											{ordinal(level)} Level &nbsp;(
											{#if participant}
												<Counter
													abbreviated={true}
													id={makeCounterID(participant, `spell-slot-${level}`)}
												/>
											{:else}
												{spellblock.slots
													? `${spellblock.slots} slot${spellblock.slots > 1 ? 's' : ''}`
													: ''}
											{/if}
											):
											{#each spellblock.spells as spell}
												{#if participant}
													<button
														class="spellbutton"
														disabled={isEmpty(
															$counters.find(findCounter(participant, `spell-slot-${level}`))
														)}
														on:click|preventDefault={() => {
															if (participant)
																consumeByParticipant(participant, `spell-slot-${level}`, 1);
														}}><TextBlock text={spell} /></button
													>{:else}
													{spell}
												{/if}
											{/each}
										</div>
										<!-- {#if participant && !!createCounter(participant, `spell-slot-${level}`, `Level ${level} spells`, spellblock.slots || 0, 0, 'day')}{/if} -->
									{/if}
								{/if}
							{/if}
						</li>
					{/each}
				{:else}
					{#if spellcasting.will}
						<li>
							<TextBlock text="At Will: " /><TextBlock text={spellcasting.will.join(', ') || ''} />
						</li>
					{/if}
					{#if spellcasting?.daily}
						{#each Object.entries(spellcasting.daily) as [numPerDay, spells]}
							<li>
								{numPerDay}: <TextBlock text={spells.join(', ') || ''} />
							</li>
						{/each}
					{/if}
				{/if}
			</ul>
		{/each}
		pass
	{/if}
</div>

<style>
	/* .spellcastingcontainer {
		display: grid;
		grid-template-columns: auto auto;
	}
	.spellcastingspan {
		grid-column: 1 / span 2;
	} */
	.spellblock.level {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
	}
	.spellbutton {
		padding: unset;
		border: unset;
	}
	.spellbutton:after {
		content: ', ';
	}
	.spellbutton:last-of-type::after {
		content: '';
	}
</style>
