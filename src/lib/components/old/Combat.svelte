<script lang="ts">
	import CombatInitiativeOrder from '../../../routes/(main)/session/[session_id]/CombatInitiativeOrder.svelte';
	import type { components } from '$lib/api/v1';
	import { browser } from '$app/environment';
	import { ChevronRightSquare, DicesIcon, PauseOctagon } from 'lucide-svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import InitiativeRoller from '$lib/components/InitiativeRoller.svelte';
	import type { Participant } from '../../../app.js';
	import { combat, wsController } from '$lib/ws';
	import { get_next_alive_participant_id, sort_participants_naive } from '$lib';
	import { createEventDispatcher } from 'svelte';
	import client from '$lib/api/index.js';
	type Combat = components['schemas']['Combat'];

	let dialog: HTMLDialogElement;
	let initDialog: Dialog;
	let showModal = false;

	export let ws: wsController;

	const dispatch = createEventDispatcher<{
		begin_combat: any;
		advance_combat: any;
		suspend_combat: any;
	}>();

	function rollInitiative(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		showModal = true;
		dialog.showModal();
	}

	let currentActiveParticipant: Participant | undefined;

	$: {
		if (browser && $combat && $combat.active_participant_id) {
			currentActiveParticipant = $combat.participants.find(
				(p) => $combat && p.participant_id == $combat.active_participant_id
			);
		}
	}

	const onBegin = (e: {
		detail: { initiatives: { participant_id: number; initiative: number }[] };
	}) => {
		// console.log(e.detail);
		if ($combat && $combat.combat_id) {
			setInitiatives($combat?.combat_id, e.detail.initiatives, true);
			// Smart Name Here?
			dispatch('begin_combat');
			dialog.close();
		}
		// currentActiveParticipant = $combat.participants.sort(sort_participants_naive)[0];
	};
	const onSuspendCombat = () => {
		dispatch('suspend_combat');
		suspendCombat(combat_id);
	};
	const advanceCombat = (e: Event) => {
		let next_participant: number;
		let first_participant: number =
			$combat.participants.toSorted(sort_participants_naive)[0].participant_id;
		let increment_round: boolean = false;
		if (!$combat) return;
		if ($combat.active_participant_id) {
			next_participant = get_next_alive_participant_id(
				$combat.active_participant_id,
				$combat.participants
			).next_participant;
			if (next_participant == first_participant) increment_round = true;
		} else {
			next_participant = $combat.participants.toSorted(sort_participants_naive)[0].participant_id;
		}
		dispatch('advance_combat', { active_participant_id: next_participant });
		set_active_participant($combat.combat_id, next_participant, increment_round);
	};
</script>

<div class="container">
	{#if $combat}
		<div class="head"><h2>Run a Combat: {$combat.title}</h2></div>
		<div class="buttonbank">
			{#if $combat.is_active}
				Currently Active: <button on:click={onSuspendCombat}><PauseOctagon />Suspend Combat</button
				><button on:click={advanceCombat}>Advance Combat <ChevronRightSquare /></button>
			{:else}
				Currently Inactive: <button on:click={rollInitiative}
					><DicesIcon /> Roll for Initiative!</button
				>
			{/if}
		</div>
		<div class="init">
			<CombatInitiativeOrder playerView={false} />
		</div>
	{/if}
</div>
<Dialog mode="mega" bind:this={initDialog}>
	<section class="icon-header" slot="header">
		<DicesIcon />Roll for Initiative
	</section>
	{#if $combat && $combat.participants}
		<InitiativeRoller participants={$combat.participants} on:begin={onBegin} />
	{/if}
</Dialog>

<!-- <Modal {showModal} bind:dialog params={{ allowCasualDismiss: false, showClose: false }}>
	{#if $combat && $combat.participants}
		<InitiativeRoller participants={$combat.participants} on:begin={onBegin} />
	{/if}
</Modal> -->

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);

		/* grid-template-rows: var(--size-10) 1fr auto 1fr 1fr 1fr;
		grid-template-columns: 1fr 1fr; */
		/* column-gap: var(--size-3); */
		/* row-gap: var(--size-3); */
	}
	.buttonbank {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 50%;
		min-width: 500px;
	}
</style>
