<script lang="ts">
	import { sort_participants_by_id } from '$lib';
	import { playerStateStore, type wsController } from '$lib/ws';
	import { Cross } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import type { RollMode } from '../../../app';

	import HitPointRow from './HitPointRow.svelte';
	import DiceRollTypeSelect from '../DiceRollTypeSelect.svelte';

	export let controller: wsController;
	type RollModeSet = RollMode | 'Set';
	let hitPointRows: HitPointRow[] = [];

	let rollModePC: RollModeSet; //; label: string };
	let rollModeNPC: RollModeSet; //; label: string };

	// let modifiedHPs: {
	// 	participant_id: number;
	// 	hit_points: number;
	// 	damage: number;
	// }[] = [];

	// const pushHPUpdate = () => {
	// 	if (!$playerStateStore.combat?.combat_id) return;
	// 	controller.updateParticipants($playerStateStore.combat?.combat_id, modifiedHPs);
	// };

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
	<!-- <div class="initiativebox"> -->
	<Table.Root style="width: 100%">
		<Table.Header
			><Table.Row>
				<Table.Head>Name (Hit Dice)</Table.Head><Table.Head>Damage</Table.Head><Table.Head
					>Max HP</Table.Head
				>
			</Table.Row>
		</Table.Header>
		<Table.Header>
			<Table.Row>
				<Table.Head>
					<h5>PCs</h5>
				</Table.Head>
				<Table.Head>
					<Button variant="outline" on:click={() => healAll(true)} class="m-1"
						>Heal all PCs <Cross class="h-4 w-4 ml-1" color="green" />
					</Button>
				</Table.Head>

				<Table.Head>
					<DiceRollTypeSelect
						bind:value={rollModePC}
						heading="Select a Roll Mode"
						placeholder="Set All PCs:"
						on:change={(e) => {
							rollAll(true, e.detail.value);
						}}
					/>
				</Table.Head>
			</Table.Row>
		</Table.Header>
		{#each $playerStateStore.combat.participants.toSorted(sort_participants_by_id) as participant (participant.participant_id)}
			{#if participant.is_PC}
				<Table.Row>
					<HitPointRow
						bind:participant
						on:hitpoint_update={onUpdateHitpoints}
						bind:this={hitPointRows[participant.participant_id]}
					/>
				</Table.Row>
			{/if}
		{/each}
		<Table.Header>
			<Table.Row>
				<Table.Head>
					<h5>NPCs</h5>
				</Table.Head>
				<Table.Head>
					<Button variant="outline" on:click={() => healAll(false)} class="m-1">
						Heal all NPCs <Cross class="h-4 w-4 ml-1" color="green" />
					</Button>
				</Table.Head>

				<Table.Head>
					<DiceRollTypeSelect
						bind:value={rollModeNPC}
						heading="Select a Roll Mode"
						placeholder="Set All NPCs:"
						on:change={(e) => {
							rollAll(false, e.detail.value);
						}}
					/>
				</Table.Head>
			</Table.Row>
		</Table.Header>

		{#each $playerStateStore.combat.participants.toSorted(sort_participants_by_id) as participant (participant.participant_id)}
			{#if !participant.is_PC}
				<Table.Row>
					<HitPointRow
						bind:participant
						on:hitpoint_update={onUpdateHitpoints}
						bind:this={hitPointRows[participant.participant_id]}
					/>
				</Table.Row>
			{/if}
		{/each}
	</Table.Root>
	<!-- </div> -->
{:else}
	No Combat Defined
{/if}
