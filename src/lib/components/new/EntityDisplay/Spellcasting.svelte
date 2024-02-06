<script lang="ts">
	import { capitalise, ordinal } from '$lib';
	import { spellNameToID, type SpellLevel, type Spellcasting } from '$lib/jsonschema';
	import {
		consume,
		consumeByParticipant,
		counters,
		createCounter,
		findCounter,
		isEmpty,
		makeCounterID,
		remaining
	} from '$lib/stores/counterStore';
	import Counter from './Counter.svelte';
	import type { Participant } from '../../../../app';
	import TextBlock from './TextBlock.svelte';
	import { Button } from '$lib/components/ui/button';

	export let spellcastings: Spellcasting[];
	export let participant: Participant | undefined;
	// | undefined = {
	// 	participant_id: Math.floor(Math.random() * 50),
	// 	combat_id: 3
	// } as Participant;

	const levels: SpellLevel[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
</script>

<div class="spellcastingcontainer">
	{#if spellcastings}
		<div class="grid grid-cols-[auto_auto_1fr] align-middle gap-x-1">
			{#each spellcastings as spellcasting}
				<h3 class="flex text-lg italic items-center col-span-3">
					{spellcasting.name} ({capitalise(spellcasting.ability)})
				</h3>
				<TextBlock class="col-span-3" text={spellcasting.headerEntries?.join(', ') || ''} />
				{#if 'spells' in spellcasting}
					{#each levels as level}
						{#if spellcasting?.spells && level in spellcasting.spells}
							{@const spellblock = spellcasting.spells[level]}
							{#if spellblock}
								{#if level == '0'}
									<span class="self-center"> Cantrips </span>
									<div class="self-center text-center">(at will)</div>
									<div class="flex flex-row gap-2">
										{#each spellblock.spells as spell}
											<Button variant="ghost" class="spellbutton py-1 px-1">
												<TextBlock text={spell} />
											</Button>
										{/each}
									</div>
								{:else if spellblock.spells}
									<span class="self-center">
										{ordinal(level)} Level
									</span>
									<div class="flex flex-row items-center justify-start">
										{#if participant}
											<Counter
												abbreviated={true}
												id={makeCounterID(participant, `spell-slot-${level}`)}
											/>
										{:else}
											({spellblock.slots
												? `${spellblock.slots} slot${spellblock.slots > 1 ? 's' : ''}`
												: ''}):
										{/if}
									</div>
									<div class="flex flex-row gap-2">
										{#each spellblock.spells as spell}
											{#if participant}
												<Button
													variant="ghost"
													class="spellbutton py-1 px-1"
													disabled={isEmpty(
														$counters.find(findCounter(participant, `spell-slot-${level}`))
													)}
													on:click={() => {
														if (participant)
															consumeByParticipant(participant, `spell-slot-${level}`, 1);
													}}
												>
													<TextBlock text={spell} />
												</Button>
											{:else}
												<Button variant="ghost" class="spellbutton py-1 px-1">
													<TextBlock text={spell} />
												</Button>
											{/if}
										{/each}
									</div>
								{/if}
							{/if}
						{/if}
					{/each}
				{:else}
					{#if spellcasting.will}
						<TextBlock text="At will:" class="self-center text-center col-span-2" />
						<div class="flex flex-row gap-2">
							{#each spellcasting.will as spell}
								<Button variant="ghost" class="spellbutton py-1 px-1">
									<TextBlock text={spell} />
								</Button>
							{/each}
						</div>
					{/if}
					{#if spellcasting?.daily}
						{#each Object.entries(spellcasting.daily) as [numPerDay, spells]}
							{@const each = numPerDay.includes('e')}
							{@const num = numPerDay.substring(0, numPerDay.length - (each ? 1 : 0))}
							{#if participant}
								<TextBlock text={numPerDay} class="self-center text-right" />
								<div class="flex flex-row items-center justify-start">
									<Counter
										abbreviated={true}
										id={makeCounterID(participant, `spell-day-${numPerDay}`)}
									/>
								</div>
							{:else}
								<div class="flex flex-row items-center justify-start col-span-2">
									{num}{each ? ' each' : ''}/day
								</div>
							{/if}
							<div class="flex flex-row gap-2">
								{#each spells as spell}
									{@const s = spellNameToID(spell)}
									{@const counterID = each
										? `spell-day-${numPerDay}-${s.spellID}`
										: `spell-day-${numPerDay}`}
									{#if participant}
										{@const counter = $counters.find(findCounter(participant, counterID))}
										<Button
											variant="ghost"
											class="spellbutton py-1 px-1"
											disabled={remaining(counter) == 0}
											on:click={() => {
												if (participant) {
													consumeByParticipant(participant, counterID, 1);
												}
											}}
										>
											{#if each}
												{#if participant}
													{@const num = numPerDay.substring(0, numPerDay.length - 1)}
													<TextBlock
														text={`${spell} (${remaining(
															$counters.find(findCounter(participant, counterID))
														)})`}
													/>
												{:else}
													<TextBlock text={spell} />
												{/if}
											{:else}
												<TextBlock text={spell} />
											{/if}
										</Button>
									{:else}
										<Button variant="ghost" class="spellbutton py-1 px-1">
											<TextBlock text={spell} />
										</Button>
									{/if}
								{/each}
							</div>
							<!-- <li>
								{numPerDay}: <TextBlock text={spells.join(', ') || ''} />
							</li> -->
						{/each}
					{/if}
				{/if}
				<!-- </ul> -->
			{/each}
		</div>
	{/if}
</div>
