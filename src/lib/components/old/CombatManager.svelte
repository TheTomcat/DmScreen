<script lang="ts">
	import CombatInitiativeOrder from '$lib/components/CombatInitiativeOrder.svelte';
	import type { components } from '$lib/api/v1';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { ChevronRightSquare, DicesIcon, PauseOctagon } from 'lucide-svelte';
	import Modal from '$lib/components/Modal.svelte';
	import InitiativeRoller from '$lib/components/InitiativeRoller.svelte';
	import ParticipantRow from '$lib/components/ParticipantRow.svelte';
	//import { isActive } from '$lib/stores/combatStore';
	import type { Participant } from '../../../app.js';
	import { combat } from '$lib/ws';
	import {
		// combat,
		loadCombat,
		setInitiatives,
		set_active_participant,
		suspendCombat
	} from '$lib/stores/combatStore';
	import { sessionStore } from '$lib/stores/sessionStore.js';
	import { page } from '$app/stores';
	import { get_next_alive_participant_id, sort_participants_naive } from '$lib';
	import { createEventDispatcher } from 'svelte';
	import client from '$lib/api/index.js';
	type Combat = components['schemas']['Combat'];

	// export let data;
	// let combat: Combat;
	let dialog: HTMLDialogElement;
	let showModal = false;
	export let combat_id: number = 0; // = parseInt($page.url.searchParams.get('combat_id') || '1');
	let session_id = parseInt($page.url.searchParams.get('session_id') || '1');
	const dispatch = createEventDispatcher();
	// onMount(() => {
	// 	if (!browser) return;
	// 	// if (!data?.data) return;
	// 	// client.GET('/session/{session_id}', {params: {path: {session_id}}}).then(response => {
	// 	// 	if (!response.data) return
	// 	// 	combat_id = response.data.

	// 	// })

	// 	loadCombat(combat_id);
	// 	// combat = data.data;
	// });

	function rollInitiative(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		showModal = true;
		dialog.showModal();
		// console.log(showModal);
		// Show initiative roller box
		// Set initiatives
		// SmartName as needed
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
		setInitiatives(combat_id, e.detail.initiatives, true);
		// Smart Name Here?
		dispatch('begin_combat');
		dialog.close();
		// currentActiveParticipant = $combat.participants.sort(sort_participants_naive)[0];
	};
	const onSuspendCombat = () => {
		dispatch('suspend_combat');
		suspendCombat(combat_id);
	};
	const advanceCombat = (e: Event) => {
		let next_participant: number;
		let first_participant: number = $combat
			? $combat.participants.toSorted(sort_participants_naive)[0].participant_id
			: 0;
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
<Modal {showModal} bind:dialog params={{ allowCasualDismiss: false, showClose: false }}>
	{#if $combat && $combat.participants}
		<InitiativeRoller participants={$combat.participants} on:begin={onBegin} />
	{/if}
</Modal>

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
