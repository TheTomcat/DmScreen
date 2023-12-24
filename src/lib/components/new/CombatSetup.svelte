<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { DicesIcon, Droplets } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { roll_dice } from '$lib';
	import Dialog from './../Dialog.svelte';
	import InitiativeRow from './../InitiativeRow.svelte';
	import HitPointRow from './HitPointRow.svelte';

	const dispatch = createEventDispatcher<{
		changeParticipant: { participants: PartialParticipant[] };
		// setHitPoints: {};
		setInitiatives: {};
		submitForm: {};
	}>();

	type Participant = components['schemas']['Participant'];

	let participants: Participant[] = [];
	let dialog: Dialog;
	export let step: 'initiative' | 'hp' = 'hp';

	type Initiative = {
		participant_id: number;
		initiative: number;
		initiative_modifier: number;
	};
	// type HitPoints = { participant_id: number; max_hp: number; damage: number };
	type PartialParticipant = Initiative; //| HitPoints | (Initiative & HitPoints);
	let updated_participants: PartialParticipant[] = [];

	export const open = (new_participants: Participant[]) => {
		participants = [...new_participants];
		updated_participants = [];
		dialog.open();
	};

	const updateParticipants = (partial_participants: PartialParticipant[]) => {
		participants = participants.map((p) => {
			let partial_participant = partial_participants.find(
				(pp) => pp.participant_id === p.participant_id
			);
			if (partial_participant) {
				return { ...p, ...partial_participant };
			} else {
				return p;
			}
		});
		dispatch('changeParticipant', { participants: updated_participants });
	};

	const updateInitiative = (
		participant_id: number,
		initiative: number,
		initiative_modifier: number = 0
	) => {
		if (updated_participants.find((p) => p.participant_id === participant_id)) {
			updated_participants = updated_participants.map((up) => {
				if (up.participant_id === participant_id) {
					return { ...up, initiative, initiative_modifier };
				}
				return up;
			});
		} else {
			updated_participants = [
				...updated_participants,
				{ participant_id, initiative, initiative_modifier }
			];
		}
		dispatch('setInitiatives', {});
	};

	// const updateHitpoints = (participant_id: number, max_hp: number, damage: number) => {
	// 	if (updated_participants.find((p) => p.participant_id === participant_id)) {
	// 		updated_participants = updated_participants.map((up) => {
	// 			if (up.participant_id === participant_id) {
	// 				return { ...up, max_hp, damage };
	// 			}
	// 			return up;
	// 		});
	// 	} else {
	// 		updated_participants = [...updated_participants, { participant_id, max_hp, damage }];
	// 	}
	// 	dispatch('setHitPoints', {});
	// };

	const onUpdateInitiative = (e: CustomEvent) => {
		updateInitiative(e.detail.participant_id, e.detail.initiative, e.detail.initiative_modifier);
		updateParticipants([
			{
				participant_id: e.detail.participant_id,
				initiative: e.detail.initiative,
				initiative_modifier: e.detail.initiative_modifier
			}
		]);
	};

	// const onUpdateHitpoints = (e: CustomEvent) => {
	// 	updateHitpoints(e.detail.participant_id, e.detail.max_hp, e.detail.damage);
	// 	updateParticipants([
	// 		{
	// 			participant_id: e.detail.participant_id,
	// 			max_hp: e.detail.max_hp,
	// 			damage: e.detail.damage
	// 		}
	// 	]);
	// };

	const rollInitiative = () => {
		participants.forEach((p) =>
			updateInitiative(
				p.participant_id,
				p.initiative_modifier ? p.initiative_modifier + roll_dice(20) : roll_dice(20),
				p.initiative_modifier
			)
		);
		updateParticipants(updated_participants);
	};

	// const healAll = () => {
	// 	participants.forEach((p) => updateHitpoints(p.participant_id, p.max_hp || 1, 0));
	// 	updateParticipants(updated_participants);
	// };

	const submit = () => {
		// dispatch('changeParticipant', { participants: updated_participants });
		dispatch('submitForm', {});
	};
</script>

<Dialog mode="mega" bind:this={dialog}>
	<section slot="header">
		{#if step == 'initiative'}
			<div class="icon-header">
				<DicesIcon />
				<h3>Roll Initiative</h3>
			</div>
		{:else}
			<div class="icon-header">
				<Droplets />
				<h3>Set HP</h3>
			</div>
		{/if}
	</section>
	<div class="content" slot="content">
		{#if step == 'initiative'}
			<div class="initiativebox">
				<!-- <div class="PCs"> -->
				<table style="width: 100%">
					<thead><th colspan="3">PCs</th></thead>
					<thead><th>Name</th><th>Roll</th><th>Initiative</th></thead>
					{#each participants as participant (participant.participant_id)}
						{#if participant.is_PC}
							<tr>
								<InitiativeRow bind:participant on:initiative_update={onUpdateInitiative} />
							</tr>
						{/if}
					{/each}

					<thead><th colspan="3">NPCs</th></thead>
					<thead><th>Name</th><th>Roll</th><th>Initiative</th></thead>
					{#each participants as participant (participant.participant_id)}
						{#if !participant.is_PC}
							<tr>
								<InitiativeRow bind:participant on:initiative_update={onUpdateInitiative} />
							</tr>
						{/if}
					{/each}
				</table>
			</div>
		{:else}
			<!-- <div class="initiativebox">
				<table style="width: 100%">
					<thead><th>Name (Hit Dice)</th><th>Damage</th><th>Max HP</th></thead>
					<tr><td colspan="4">PCs</td></tr>
					{#each participants as participant (participant.participant_id)}
						{#if participant.is_PC}
							<tr>
								<HitPointRow bind:participant on:hitpoint_update={onUpdateHitpoints} />
							</tr>
						{/if}
					{/each}
					<tr><td colspan="4">NPCs</td></tr>
					{#each participants as participant (participant.participant_id)}
						{#if !participant.is_PC}
							<tr>
								<HitPointRow bind:participant on:hitpoint_update={onUpdateHitpoints} />
							</tr>
						{/if}
					{/each}
				</table>
			</div> -->
		{/if}
	</div>
	<div style="display: flex; justify-content: space-between;" slot="menu">
		{#if step == 'hp'}
			<!-- <button on:click|preventDefault={healAll}>Heal all<Droplets /></button>
			<button on:click={submit}>Submit</button> -->
		{:else}
			<button on:click|preventDefault={rollInitiative}>Roll all<DicesIcon /></button>
			<button on:click={submit}>Submit</button>
		{/if}
	</div>
</Dialog>

<style>
	.icon-header {
		display: flex;
		gap: var(--size-3);
		align-items: center;
	}
	* {
		padding-block: var(--size-2);
	}
	.initiativebox {
		min-width: 800px;
		/* max-height: 500px; */
		display: grid;
		grid-template-columns: 1fr;
		justify-content: start;
		align-items: start;
		column-gap: var(--size-2);
	}
	.PCs,
	.NPCs {
		display: grid;
		/* grid-template-columns: auto var(--size-10) var(--size-10) var(--size-10); */
		grid-template-columns: repeat(5, var(--size-10)); /* var(--size-10) var(--size-10); */
	}
</style>
