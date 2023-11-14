<script lang="ts">
	import type { Combat, Initiative } from '../app';
	import InitiativeRow from './InitiativeRow.svelte';
	import { combat, updateParticipant } from '../stores/combatStore';
	// export let combat: Combat;
	// export let updateParticipant: Function;
	// let initiatives: Initiative[];
	export let open: boolean;
	const getInitiative = (combat: Combat): Initiative => {
		return {
			combat_id: combat.combat_id,
			rolls: combat.participants.map((participant) => {
				return {
					participant_id: participant.participant_id,
					initiative: participant.initiative
				};
			})
		};
	};
</script>

<dialog {open}>
	{#if $combat && $combat.participants}
		<div class="initiativebox">
			<div class="PCs">
				{#each $combat.participants as participant (participant.participant_id)}
					{#if participant.is_PC}
						<InitiativeRow {participant} update={updateParticipant} />
					{/if}
				{/each}
			</div>
			<div class="NPCs">
				{#each $combat.participants as participant (participant.participant_id)}
					{#if !participant.is_PC}
						<InitiativeRow {participant} update={updateParticipant} />
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</dialog>

<style>
	dialog[open] {
		z-index: 1;
	}
	.initiativebox {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.PCs,
	.NPCs {
		display: grid;
		grid-template-columns: auto var(--size-10) var(--size-10) var(--size-10);
	}
</style>
