<script lang="ts">
	import { apiGetCombat } from '$lib/api';
	import { onMount } from 'svelte';
	import type { Combat, Participant } from '../app';
	import ParticipantRow from './ParticipantRow.svelte';
	import { FolderPlus, Heart, Pause, ShieldHalf } from 'lucide-svelte';

	import {
		combat,
		updateParticipant,
		loading,
		sort_participants_naive,
		reorderParticipants,
		type ParticipantID
	} from '../stores/combatStore';

	// import { dndzone, SOURCES, TRIGGERS, type DndEvent, setDebugMode } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	// setDebugMode(true);
	const flipDurationMs = 200;
	// let dragDisabled = false;

	// function handleConsider(e: CustomEvent<DndEvent<ParticipantID>>) {
	// 	const {
	// 		items: newItems,
	// 		info: { source, trigger }
	// 	} = e.detail;
	// 	console.log(newItems);
	// 	// items = newItems;
	// 	reorderParticipants(newItems);
	// 	// Ensure dragging is stopped on drag finish via keyboard
	// 	if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
	// 		dragDisabled = true;
	// 	}
	// }
	// function handleFinalize(e: any) {
	// 	const {
	// 		items: newItems,
	// 		info: { source }
	// 	} = e.detail;
	// 	reorderParticipants(newItems);
	// 	// items = newItems;
	// 	// Ensure dragging is stopped on drag finish via pointer (mouse, touch)
	// 	if (source === SOURCES.POINTER) {
	// 		dragDisabled = true;
	// 	}
	// }
</script>

<button
	on:click={() =>
		reorderParticipants($combat.participants.toSorted((a, b) => a.name.localeCompare(b.name)))}
	>Reorder</button
>
<table>
	<thead>
		<tr>
			<th />
			<th><Pause /></th>
			<th />
			<th>Name</th>
			<th><Heart /></th>
			<th><ShieldHalf /></th>
			<th>Actions</th>
		</tr>
	</thead>
	{#if $loading}
		Loading data...
	{:else}
		<tbody>
			<!-- use:dndzone={{ items: $combat.participants, dragDisabled, flipDurationMs }}
			on:consider={handleConsider}
			on:finalize={handleFinalize} -->

			{#if $combat && $combat.participants}
				{#each $combat.participants as participant (participant.participant_id)}
					<tr class="row" animate:flip={{ duration: flipDurationMs }}>
						<!-- <div class="displaycontents" animate:flip={{ duration: flipDurationMs }}> -->
						<ParticipantRow {participant} />
						<!-- </div> -->
					</tr>
				{/each}
			{/if}
		</tbody>
	{/if}
</table>

<style>
	table {
		width: 100%;
	}
	th {
		text-align: center;
	}
	th :global(svg) {
		display: block;
		margin: auto;
	}
	.row {
		gap: var(--size-1);
		padding-block: var(--size-1);
		cursor: pointer;
	}
	.row:hover {
		background-color: var(--surface-4);
	}
	.displaycontents {
		display: contents;
	}
</style>
