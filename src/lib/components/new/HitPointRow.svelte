<script lang="ts">
	import { Cross } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { roll } from '$lib/index';
	import { createEventDispatcher } from 'svelte';
	import type { RollMode } from '../../../app';

	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';

	import DiceRollTypeSelect from '../DiceRollTypeSelect.svelte';
	import Input from '../ui/input/input.svelte';
	type Participant = components['schemas']['Participant'];

	export let participant: Participant;
	type RollModeSet = RollMode | 'Set';
	let rollMode: RollModeSet = 'default';

	const dispatch = createEventDispatcher<{
		hitpoint_update: { participant_id: number; max_hp: number; damage: number };
	}>();

	const roll_hp = () => {
		if (rollMode != 'Set') {
			participant.max_hp = roll(participant.hit_dice, rollMode);
		}
		dispatch('hitpoint_update', {
			participant_id: participant.participant_id,
			max_hp: participant.max_hp || 1,
			damage: participant.damage
		});
	};

	const onHPChange = () => {
		// rollMode = 'Set';
		dispatch('hitpoint_update', {
			participant_id: participant.participant_id,
			max_hp: participant.max_hp || 1,
			damage: participant.damage || 0
		});
	};

	export const setRollMode = (newRollMode: RollModeSet) => {
		rollMode = newRollMode;
		roll_hp();
	};
</script>

{#if participant.hit_dice}
	<Table.Cell>{participant.name} ({participant.hit_dice})</Table.Cell>
{:else}
	<Table.Cell>{participant.name}</Table.Cell>
{/if}
<Table.Cell>
	<div class="flex gap-2">
		<Input class="w-[100px]" bind:value={participant.damage} type="number" on:blur={onHPChange} />
		<Button
			variant="outline"
			on:click={() => {
				dispatch('hitpoint_update', {
					participant_id: participant.participant_id,
					max_hp: participant.max_hp || 1,
					damage: 0
				});
			}}
		>
			Heal<Cross class="h-4 w-4 ml-1" color="green" />
		</Button>
	</div>
</Table.Cell>
<Table.Cell>
	<div class="flex gap-2">
		{#if participant.hit_dice}
			<DiceRollTypeSelect bind:value={rollMode} on:change={roll_hp} />
		{/if}
		<Input class="w-[100px]" bind:value={participant.max_hp} type="number" on:blur={onHPChange} />
	</div>
</Table.Cell>
