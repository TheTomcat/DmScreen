<script lang="ts">
	import type { components } from '$lib/api/v1';
	import { onMount } from 'svelte';
	import InitiativeRow from './../InitiativeRow.svelte';
	import { DicesIcon, Droplets } from 'lucide-svelte';
	import { roll_dice } from '$lib';
	import { createEventDispatcher } from 'svelte';
	import Dialog from './../Dialog.svelte';
	import { fly } from 'svelte/transition';
	import HitPointRow from './HitPointRow.svelte';

	const dispatch = createEventDispatcher();

	type Participant = components['schemas']['Participant'];

	export let participants: Participant[];
	export let dialog: Dialog;
	let step: 'initiative' | 'hp' = 'initiative';
	let direction = 1;

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
		{#if step == 'initiative'}
			<div
				in:fly={{ x: 200 * direction, duration: 200, delay: 300 }}
				out:fly={{ x: -200 * direction, duration: 200 }}
			>
				<DicesIcon />
				<h3>Roll for Initiative</h3>
			</div>
		{:else}
			<div
				in:fly={{ x: 200 * direction, duration: 200, delay: 300 }}
				out:fly={{ x: -200 * direction, duration: 200 }}
			>
				<Droplets />
				<h3>Set HP</h3>
			</div>
		{/if}
	</section>
	<div class="content" slot="content">
		{#if step == 'initiative'}
			<div
				class="initiativebox"
				in:fly={{ x: 200 * direction, duration: 200, delay: 300 }}
				out:fly={{ x: -200 * direction, duration: 200 }}
			>
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
		{:else}
			<div
				class="initiativebox"
				in:fly={{ x: 200 * direction, duration: 200, delay: 300 }}
				out:fly={{ x: -200 * direction, duration: 200 }}
			>
				<div class="PCs">
					{#each participants as participant (participant.participant_id)}
						{#if participant.is_PC}
							<HitPointRow bind:participant on:hitpoint_update={() => {}} />
						{/if}
					{/each}
				</div>
				<div class="NPCs">
					{#each participants as participant (participant.participant_id)}
						{#if !participant.is_PC}
							<HitPointRow bind:participant on:hitpoint_update={() => {}} />
						{/if}
					{/each}
				</div>
			</div>
		{/if}
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
