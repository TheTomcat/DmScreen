<script lang="ts">
	import { Cross, Dices, Droplets } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { renderModifier, roll_dice, roll } from '$lib/index';
	import { createEventDispatcher } from 'svelte';
	import type { RollMode } from '../../../app';
	type Participant = components['schemas']['Participant'];

	export let participant: Participant;
	let rollMode: RollMode | 'Set';
	// export let update: (p: Partial<Participant>) => void;
	// export let callback: (participant_id: number, initiative: number) => {};
	const dispatch = createEventDispatcher<{
		hitpoint_update: { participant_id: number; max_hp: number; damage: number };
	}>();
	let dice: number | undefined;

	$: {
		dice = (participant.initiative || 0) - (participant.initiative_modifier || 0);
	}

	const roll_hp = () => {
		if (rollMode != 'Set') {
			participant.max_hp = roll(participant.hit_dice, rollMode);
		}
	};
</script>

<!-- <div class="initrow"> -->
{#if participant.hit_dice}
	{participant.name}
	{participant.hit_dice}
	<select bind:value={rollMode}>
		<option value="one">1</option>
		<option value="min">Min</option>
		<option value="default">Average</option>
		<option value="random">Roll</option>
		<option value="max">Max</option>
		<option value="set">Set</option>
	</select>
	<button on:click={roll_hp}><Droplets /></button>
	<input
		class="initroller"
		bind:value={participant.max_hp}
		type="number"
		on:change={() =>
			dispatch('hitpoint_update', {
				participant_id: participant.participant_id,
				max_hp: participant.max_hp
			})}
	/>
	<button>Heal <Cross /></button>
{:else}
	{participant.name}
	<input
		class="initroller"
		bind:value={participant.max_hp}
		type="number"
		on:change={() =>
			dispatch('hitpoint_update', {
				participant_id: participant.participant_id,
				max_hp: participant.max_hp
			})}
	/>
{/if}

<!-- </div> -->

<style>
	.initroller {
		width: var(--size-9);
	}
	.dicecell {
		justify-self: right;
		align-self: center;
	}
</style>
