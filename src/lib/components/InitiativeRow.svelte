<script lang="ts">
	import { Dices } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { renderModifier, roll_dice } from '$lib/index';
	import { createEventDispatcher } from 'svelte';
	type Participant = components['schemas']['Participant'];

	export let participant: Participant;

	const dispatch = createEventDispatcher<{
		initiative_update: { participant_id: number; initiative: number | null | undefined };
	}>();
	let dice: number | undefined;

	$: {
		dice = (participant.initiative || 0) - (participant.initiative_modifier || 0);
	}

	const roll = () => {
		participant.initiative = (participant.initiative_modifier || 0) + roll_dice(20);
		dispatch('initiative_update', {
			participant_id: participant.participant_id,
			initiative: participant.initiative
		});
	};
</script>

<!-- <div class="initrow"> -->
<td>
	{participant.name}
</td>
<td>
	<button on:click|preventDefault={roll}><Dices /></button>
</td>
<td>
	<div class="dicecell">
		<!-- <input class="initroller" bind:value= type="number" /> -->
		{dice}{renderModifier(participant.initiative_modifier || 0)}=

		<!-- </td>
<td> -->
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
	</div>
</td>

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
