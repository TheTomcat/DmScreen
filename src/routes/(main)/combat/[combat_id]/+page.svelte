<script lang="ts">
	import {
		combat,
		getCombat,
		allEntities,
		getEntities,
		addParticipant,
		removeParticipant,
		updateParticipant
	} from '$lib/stores/combatStore';
	import EntityRow from '$lib/components/EntityRow.svelte';
	import { onMount } from 'svelte';
	import InputBox from '$lib/components/InputBox.svelte';
	import type { Combat, Entity, Participant, RollMode } from '../../../../app';
	import { apiAddParticipantToCombat, apiGetAllEntities } from '$lib/api';
	import CombatTable from '$lib/components/old/CombatTable.svelte';
	import InitiativeBox from '$lib/components/old/InitiativeBox.svelte';

	import { page } from '$app/stores';
	import { Crown, PlusSquare, Rat } from 'lucide-svelte';
	import { roll } from '$lib';

	let combat_id = parseInt($page.params.combat_id);
	let open: boolean = false;

	// export let data;
	// let allEntities: Entity[];
	let entityFilter: string = '';
	let filteredEntities: Entity[];

	onMount(() => {
		getCombat(combat_id);
		getEntities();
		// allEntities = data.entities;
		// console.log($combat);
	});

	$: filteredEntities = $allEntities.filter((entity: Entity) => {
		if (!entity.name) return;
		entity.name.toLowerCase().includes(entityFilter.toLowerCase());
	});

	const createParticipantFromEntity = (entity: Entity, mode: RollMode = 'default') => {
		let participant: Partial<Participant> = {
			combat_id: combat_id,
			name: entity.name ? next_name(entity.name, $combat.participants) : '',
			entity_id: entity.entity_id,
			max_hp: roll(entity.hit_dice, mode),
			ac: entity.ac,
			initiative_modifier: entity.initiative_modifier,
			image_id: entity.image_id
		};
		addParticipant(participant);
	};

	const next_name = (name: string, participants: Participant[]): string => {
		console.log(participants);
		for (let i = 1; i <= participants.length + 1; i++) {
			if (!participants.some((p) => p.name === `${name} ${i}`)) {
				return `${name} ${i}`;
			}
		}
		return '';
	};
</script>

<InitiativeBox {open} />
<h1>Initiative Tracker</h1>
<div class="container">
	<div class="entities">
		<div class="header">
			<h4>Add a monster:</h4>
			<InputBox bind:value={entityFilter} placeholder={'Filter...'} />
		</div>
		<div class="entitylist">
			{#each filteredEntities as entity (entity.entity_id)}
				<EntityRow {entity}>
					<button on:click={() => createParticipantFromEntity(entity, 'one')}><Rat /></button>
					<button on:click={() => createParticipantFromEntity(entity, 'max')}><Crown /></button>
					<button on:click={() => createParticipantFromEntity(entity, 'default')}
						><PlusSquare /></button
					>
				</EntityRow>
			{/each}
		</div>
	</div>
	<div class="participants">
		<CombatTable />
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 1fr 2fr;
		height: 100%;
	}
	.header {
		position: sticky;
		top: 0;
		/* background: inherit; */
	}
	.entitylist {
		/* overflow: scroll; */
		padding: var(--size-3);
		max-height: 70vh;
		overflow-y: scroll;
	}
	.participants {
		min-width: 100%;
	}
</style>
