<script lang="ts">
	import type { components } from '$lib/api/v1';
	import { onMount } from 'svelte';
	import InitiativeRow from './InitiativeRow.svelte';
	import { DicesIcon } from 'lucide-svelte';
	import { roll_dice } from '$lib';
	import { createEventDispatcher } from 'svelte';
	import Dialog from './Dialog.svelte';

	const dispatch = createEventDispatcher();

	type Participant = components['schemas']['Participant'];

	export let participants: Participant[];
	export let dialog: Dialog;

	type Initiative = { participant_id: number; initiative: number };
	let initiatives: Initiative[] = [];

	onMount(() => {
		initiatives = participants.map((p) => {
			return {
				participant_id: p.participant_id,
				initiative: p.initiative || 0,
				initiative_modifier: p.initiative_modifier
			};
		});
	});

	const updateInitiative = (participant_id: number, initiative: number) => {
		initiatives = [
			...initiatives.filter((i) => i.participant_id != participant_id),
			{ participant_id, initiative }
		];
	};

	const onUpdateInitiative = (e: CustomEvent) => {
		updateInitiative(e.detail.participant_id, e.detail.initiative);
	};

	const rollAll = () => {
		// console.log('rolling');
		participants = participants.map((p) => {
			// console.log(p.participant_id);
			return { ...p, initiative: p.initiative_modifier + roll_dice(20) };
		});
		initiatives = participants.map((p) => {
			// console.log(p.participant_id);
			return {
				participant_id: p.participant_id,
				initiative: p.initiative_modifier + roll_dice(20)
			};
		});
	};
</script>

<Dialog mode="mega" bind:this={dialog}>
	<section class="icon-header" slot="header">
		<DicesIcon />
		<h3>Roll for Initiative</h3>
	</section>
	<div class="content" slot="content">
		<div class="initiativebox">
			<div class="PCs">
				{#each participants as participant (participant.participant_id)}
					{#if participant.is_PC}
						<InitiativeRow bind:participant on:initiative_update={onUpdateInitiative} />
					{/if}
				{/each}
			</div>
			<div class="NPCs">
				{#each participants as participant (participant.participant_id)}
					{#if !participant.is_PC}
						<InitiativeRow bind:participant on:initiative_update={onUpdateInitiative} />
					{/if}
				{/each}
			</div>
		</div>
	</div>
	<div style="display: flex; justify-content: space-between;" slot="menu">
		<button on:click|preventDefault={rollAll}>Roll all<DicesIcon /></button>
		<!-- <button on:click|preventDefault={() => dispatch('begin', { initiatives })}>Begin!</button> -->
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
		display: grid;
		grid-template-columns: 1fr 1fr;
		justify-content: start;
		align-items: start;
		column-gap: var(--size-2);
	}
	.PCs,
	.NPCs {
		display: grid;
		grid-template-columns: auto var(--size-10) var(--size-10) var(--size-10);
	}
</style>
