<script lang="ts">
	import { capitalise, ordinal } from '$lib';
	import {
		spellNameToID,
		type SpellLevel,
		type Spellcasting,
		stats,
		type Stat
	} from '$lib/jsonschema';
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

	import * as Select from '$lib/components/ui/select';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { MinusCircle, PlusCircle, Trash2 } from 'lucide-svelte';

	export let spellcastings: Spellcasting[];
	// | undefined = {
	// 	participant_id: Math.floor(Math.random() * 50),
	// 	combat_id: 3
	// } as Participant;

	const levels: SpellLevel[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	const dailies = ['will', '1', '2', '3', '1e', '2e', '3e'];
	let spellAbility: { value: Stat; label: string; disabled: boolean } | undefined;
	let spellLevels = levels.map((l) => {
		return { label: l, value: l, disabled: false };
	});
	let spellDaily = dailies.map((d) => {
		return {
			label: d == 'will' ? 'At Will' : `${d}${d.includes('e') ? ' each' : ''}/day`,
			value: d,
			disabled: false
		};
	});

	let spellAbilityOptions = stats.map((s) => {
		return { label: capitalise(s), value: s, disiabled: false };
	});
</script>

<div class="spellcastingcontainer">
	{#if spellcastings}
		<div class="grid grid-cols-[auto_auto_1fr] align-middle gap-x-1">
			{#each spellcastings as spellcasting, i}
				<h3 class="flex text-lg italic items-center col-span-3">
					<Input value={spellcasting.name} />
					<Select.Root
						portal={null}
						selected={spellAbilityOptions.find((s) => s.value == spellcastings[i].ability)}
						onSelectedChange={(e) => {
							if (e) spellcastings[i].ability = e?.value;
						}}
					>
						<Select.Trigger class="w-[180px]">
							<Select.Value placeholder="Select an ability" />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Spellcasing Ability</Select.Label>
								{#each stats as stat}
									<Select.Item value={stat} label={capitalise(stat)}>
										{capitalise(stat)}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
						<Select.Input name="Stat" bind:value={spellcastings[i].ability} />
					</Select.Root>
				</h3>
				<Textarea class="col-span-3" value={spellcasting.headerEntries?.join(', ') || ''} />
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
											<Input value={spell} />
										{/each}
										<Button><PlusCircle /></Button>
										<Button><MinusCircle /></Button>
									</div>
								{:else if spellblock.spells}
									<span class="self-center">
										{ordinal(level)} Level
									</span>
									<div class="flex flex-row items-center justify-start">
										<Input value={spellblock.slots} />
									</div>
									<div class="flex flex-row gap-2">
										{#each spellblock.spells as spell}
											<Input value={spell} />
										{/each}
										<Button><PlusCircle /></Button>
										<Button><MinusCircle /></Button>
										<Button><Trash2 /></Button>
									</div>
								{/if}
							{/if}
						{/if}
					{/each}
				{:else}
					{#if spellcasting.will}
						<div class="self-center text-center col-span-2">At will:</div>
						<div class="flex flex-row gap-2">
							{#each spellcasting.will as spell}
								<Textarea value={spell} />
							{/each}
						</div>
					{/if}
					{#if spellcasting?.daily}
						{#each Object.entries(spellcasting.daily) as [numPerDay, spells]}
							{@const each = numPerDay.includes('e')}
							{@const num = numPerDay.substring(0, numPerDay.length - (each ? 1 : 0))}

							<div class="flex flex-row items-center justify-start col-span-2">
								<Input value={numPerDay} class="w-[80px]" />
								<Select.Root
									portal={null}
									selected={spellDaily.find((s) => s.value == numPerDay)}
									onSelectedChange={(e) => {
										// if (e) spellcastings[i].daily[] = e?.value;
									}}
								>
									<Select.Trigger class="w-[180px]">
										<Select.Value placeholder="Select an ability" />
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Spellcasing Ability</Select.Label>
											{#each spellDaily as daily}
												<Select.Item value={daily.value} label={daily.label}>
													{daily.label}
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
									<Select.Input name="Stat" />
								</Select.Root>
								<!-- {num}{each ? ' each' : ''}/day -->
							</div>

							<div class="flex flex-row gap-2">
								{#each spells as spell}
									{@const s = spellNameToID(spell)}
									{@const counterID = each
										? `spell-day-${numPerDay}-${s.spellID}`
										: `spell-day-${numPerDay}`}

									<Input value={spell} />
								{/each}
								<Button><PlusCircle /></Button>
								<Button><MinusCircle /></Button>
								<Button><Trash2 /></Button>
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
