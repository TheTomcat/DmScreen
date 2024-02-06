<script lang="ts">
	import { Dices } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { renderModifier, roll_dice } from '$lib/index';
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	import Input from '$lib/components/ui/input/input.svelte';
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
	<Button variant="outline" class="m-1" on:click={roll}><Dices class="w-4 h-4" /></Button>
</td>
<td class="text-right">
	<!-- <div class="dicecell"> -->
	<!-- <input class="initroller" bind:value= type="number" /> -->
	{dice}{renderModifier(participant.initiative_modifier || 0)}=
</td>
<td>
	<Input
		class="w-[100px]"
		bind:value={participant.initiative}
		type="number"
		on:change={() =>
			dispatch('initiative_update', {
				participant_id: participant.participant_id,
				initiative: participant.initiative
			})}
	/>
	<!-- </div> -->
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
