<script lang="ts">
	import { Dices } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { renderModifier, roll_dice } from '$lib/index';
	import { createEventDispatcher } from 'svelte';
	type Participant = components['schemas']['Participant'];

	export let participant: Participant;
	// export let update: (p: Partial<Participant>) => void;
	// export let callback: (participant_id: number, initiative: number) => {};
	const dispatch = createEventDispatcher();
	let dice: number | undefined;

	$: {
		dice = (participant.initiative || 0) - (participant.initiative_modifier || 0);
	}

	const roll = () => {
		participant.initiative = participant.initiative_modifier + roll_dice(20);
	};
</script>

<!-- <div class="initrow"> -->
{participant.name}
<button on:click={roll}><Dices /></button>
<div class="dicecell">
	<!-- <input class="initroller" bind:value= type="number" /> -->
	{dice}{renderModifier(participant.initiative_modifier || 0)}=
</div>
<input
	class="initroller"
	bind:value={participant.initiative}
	type="number"
	on:change={() =>
		dispatch('initiative_update', {
			participant_id: participant.participant_id,
			initiative: participant.initiative
		})}
/>

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
