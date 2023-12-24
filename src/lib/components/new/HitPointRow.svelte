<script lang="ts">
	import { Cross } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { roll } from '$lib/index';
	import { createEventDispatcher } from 'svelte';
	import type { RollMode } from '../../../app';
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
		rollMode = 'Set';
		dispatch('hitpoint_update', {
			participant_id: participant.participant_id,
			max_hp: participant.max_hp || 1,
			damage: participant.damage || 0
		});
	};

	export const setRollMode = (newRollMode: RollModeSet) => {
		// console.log(participant.participant_id, newRollMode);
		rollMode = newRollMode;
		roll_hp();
	};
</script>

<!-- <div class="initrow"> -->

{#if participant.hit_dice}
	<td>{participant.name} ({participant.hit_dice})</td>
{:else}
	<td>{participant.name}</td>
{/if}
<td>
	<input class="initroller" bind:value={participant.damage} type="number" />
	<button
		on:click|preventDefault={() => {
			dispatch('hitpoint_update', {
				participant_id: participant.participant_id,
				max_hp: participant.max_hp || 1,
				damage: 0
			});
		}}>Heal <Cross color="green" /></button
	>
</td>
<td>
	{#if participant.hit_dice}
		<select bind:value={rollMode} on:change={roll_hp}>
			<option value="one">1</option>
			<option value="min">Min</option>
			<option value="default">Default</option>
			<option value="random">Roll</option>
			<option value="max">Max</option>
			<option value="Set">Set</option>
		</select>
	{/if}
	<input class="initroller" bind:value={participant.max_hp} type="number" on:change={onHPChange} />
</td>

<!-- </div> -->

<style>
	.initroller {
		width: var(--size-9);
	}
</style>
