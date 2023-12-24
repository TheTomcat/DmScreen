<script lang="ts">
	import { sort_participants_by_id } from '$lib';
	import { combat, playerStateStore, type wsController } from '$lib/ws';
	import { Cross } from 'lucide-svelte';
	import type { RollMode } from '../../../app';

	import HitPointRow from './HitPointRow.svelte';

	export let controller: wsController;
	type RollModeSet = RollMode | 'Set';
	let hitPointRows: HitPointRow[] = [];

	let rollModePC: RollModeSet;
	let rollModeNPC: RollModeSet;

	const onUpdateHitpoints = (
		e: CustomEvent<{ participant_id: number; max_hp: number; damage: number }>
	): void => {
		controller.updateParticipant(e.detail.participant_id, {
			max_hp: e.detail.max_hp,
			damage: e.detail.damage
		});
	};
	const healAll = (healPCs: boolean) => {
		if (!$playerStateStore.combat || !$playerStateStore.combat.participants) return;
		$playerStateStore.combat.participants.forEach((p) => {
			if (p.is_PC === healPCs)
				controller.updateParticipant(p.participant_id, { max_hp: p.max_hp, damage: 0 });
		});
	};
	const rollAll = (rollPCs: boolean, rollMode: RollModeSet) => {
		if (!$playerStateStore.combat || !$playerStateStore.combat.participants) return;
		$playerStateStore.combat.participants.forEach((p) => {
			if (p.is_PC === rollPCs) hitPointRows[p.participant_id].setRollMode(rollMode);
		});
	};
</script>

{#if $playerStateStore.combat}
	<div class="initiativebox">
		<table style="width: 100%">
			<thead><th>Name (Hit Dice)</th><th>Damage</th><th>Max HP</th></thead>
			<tr>
				<td> <h5>PCs</h5> </td>
				<td>
					<button on:click={() => healAll(true)}>Heal all PCs <Cross color="green" /></button>
				</td>
				<td
					>Set all PCs:
					<select bind:value={rollModePC} on:change={() => rollAll(true, rollModePC)}>
						<option value="one">1</option>
						<option value="min">Min</option>
						<option value="default">Default</option>
						<option value="random">Roll</option>
						<option value="max">Max</option>
						<option value="Set">Set</option>
					</select></td
				>
			</tr>
			{#each $playerStateStore.combat.participants.toSorted(sort_participants_by_id) as participant (participant.participant_id)}
				{#if participant.is_PC}
					<tr>
						<HitPointRow
							bind:participant
							on:hitpoint_update={onUpdateHitpoints}
							bind:this={hitPointRows[participant.participant_id]}
						/>
					</tr>
				{/if}
			{/each}
			<tr>
				<td> <h5>NPCs</h5> </td>
				<td>
					<button on:click={() => healAll(false)}>Heal all NPCs <Cross color="green" /></button>
				</td>
				<td
					>Set all NPCs:
					<select bind:value={rollModeNPC} on:change={() => rollAll(false, rollModeNPC)}>
						<option value="one">1</option>
						<option value="min">Min</option>
						<option value="default">Default</option>
						<option value="random">Roll</option>
						<option value="max">Max</option>
						<option value="Set">Set</option>
					</select></td
				>
			</tr>
			{#each $playerStateStore.combat.participants.toSorted(sort_participants_by_id) as participant (participant.participant_id)}
				{#if !participant.is_PC}
					<tr>
						<HitPointRow
							bind:participant
							on:hitpoint_update={onUpdateHitpoints}
							bind:this={hitPointRows[participant.participant_id]}
						/>
					</tr>
				{/if}
			{/each}
		</table>
	</div>
{:else}
	No Combat Defined
{/if}
