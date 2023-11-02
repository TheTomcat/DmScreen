<script lang="ts">
	import { Dices } from 'lucide-svelte';
	import type { Participant } from '../app';

	export let participant: Participant;
	export let update: (p: Partial<Participant>) => void;
	let dice: number;

	$: {
		dice = participant.initiative - participant.initiative_modifier;
	}

	const roll = () => {
		let val = Math.floor(Math.random() * 20) + 1;
		participant.initiative = val + participant.initiative_modifier;
	};

	const renderMod = (modifier: number) => {
		if (modifier >= 0) return `+${modifier}`;
		return `${modifier}`;
	};
</script>

<!-- <div class="initrow"> -->
{participant.name}
<button on:click={roll}><Dices /></button>
<div class="dicecell">
	<!-- <input class="initroller" bind:value= type="number" /> -->
	{dice}{renderMod(participant.initiative_modifier)}=
</div>
<input class="initroller" bind:value={participant.initiative} type="number" />

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
