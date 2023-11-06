<script lang="ts">
	import EntityRow from '../../../../components/EntityRow.svelte';
	import { onMount } from 'svelte';

	import InputBox from '../../../../components/InputBox.svelte';
	import type { Entity, Participant, Combat } from '../../../../app';

	import { Edit, Minus, Plus, PlusSquare, X } from 'lucide-svelte';
	import { apiAddParticipantToCombat, apiCreateCombat } from '$lib/api';
	import { roll } from '$lib';
	import { flip } from 'svelte/animate';
	import Modal from '../../../../components/Modal.svelte';
	import EntityBox from '../../../../components/EntityBox.svelte';

	//https://svelte.dev/repl/6fbaf2115a31423b9e5b989423dce38a?version=3.42.5 Shake animation
	export let data;

	let entityFilter: string = '';
	let allEntities: Entity[];
	let filteredEntities: Entity[];
	let showPCs: boolean = false;
	let showNPCs: boolean = true;
	let title: string;
	// let dialogVisible: boolean = true;

	let combatants: { entity: Entity; count: number }[] = [];

	let flipDurationMs: number = 200;

	// let entitybox;

	onMount(() => {
		allEntities = data.entities;
	});

	$: {
		// console.log(allEntities);
		filteredEntities = allEntities?.filter(
			(entity) =>
				entity.name.toLowerCase().includes(entityFilter.toLowerCase()) &&
				((entity.is_PC && showPCs) || (!entity.is_PC && showNPCs))
		);
	}

	let addCombatant = (entity: Entity) => {
		let index = combatants?.findIndex(
			(combatant) => combatant.entity.entity_id == entity.entity_id
		);
		if (index > -1) {
			let combatant = combatants[index];
			return () => {
				combatants = [
					...combatants.slice(0, index),
					{ ...combatant, count: combatant.count + 1 },
					...combatants.slice(index + 1)
				];
			};
		}
		return () => {
			combatants = [...combatants, { entity, count: 1 }];
		};
	};

	let removeCombatant = (entity: Entity) => {
		let index = combatants?.findIndex(
			(combatant) => combatant.entity.entity_id == entity.entity_id
		);
		if (index > -1) {
			combatants = [...combatants.slice(0, index), ...combatants.slice(index + 1)];
		}
	};

	let changeCount = (entity: Entity, addor: number) => {
		// console.log(entity);
		let index = combatants?.findIndex(
			(combatant) => combatant.entity.entity_id == entity.entity_id
		);
		if (combatants[index].count + addor <= 0) {
			removeCombatant(combatants[index].entity);
			return;
		}
		combatants = [
			...combatants.slice(0, index),
			{ ...combatants[index], count: combatants[index].count + addor },
			...combatants.slice(index + 1)
		];
	};

	let buildEncounter = () => {
		if (!title) return;
		if (!combatants.length) return;
		apiCreateCombat(fetch, title).then((combat) => {
			combatants.forEach(({ entity, count }) => {
				for (let i = 0; i < count; i++) {
					let participant: Partial<Participant> = {
						combat_id: combat.combat_id,
						name: `${entity.name}${i > 0 ? ` ${i + 1}` : ''}`,
						entity_id: entity.entity_id,
						max_hp: roll(entity.hit_dice, 'default'),
						ac: entity.ac,
						initiative_modifier: entity.initiative_modifier,
						image_id: entity.image_id
					};
					apiAddParticipantToCombat(fetch, participant);
				}
			});
		});
	};
</script>

<!-- {@debug combatants} -->
<h1>Combat Builder</h1>

<div class="container">
	<div class="entities">
		{#if filteredEntities}
			<div class="header">
				<h4>Add a monster:</h4>
				<InputBox bind:value={entityFilter} placeholder={'Filter...'} />
				Show:<button class:selected={showPCs} on:click={() => (showPCs = !showPCs)}>{'PCs'}</button>
				<button class:selected={showNPCs} on:click={() => (showNPCs = !showNPCs)}>{'NPCs'}</button>
				{filteredEntities.length} results
			</div>
			<div class="entitylist">
				{#each filteredEntities as entity (entity.entity_id)}
					<EntityRow {entity}>
						<button on:click={addCombatant(entity)}><PlusSquare /></button>
						<!-- <button on:click={() => (entitybox.showModal = true)}><Edit /></button> -->
					</EntityRow>
				{/each}
			</div>
		{:else}
			Loading entities...
		{/if}
	</div>
	<div class="combatants">
		<div class="description">
			<span>Combat title:</span><input
				bind:value={title}
				placeholder="You must enter a title"
			/><button class="selected" disabled={!title || !combatants.length} on:click={buildEncounter}
				>Create Combat</button
			>
		</div>
		{#if combatants}
			<table>
				<thead>
					<th>Combatant</th>
					<th>CR</th>
					<th>Count</th>
					<th />
				</thead>
				<tbody>
					{#each combatants as combatant (combatant.entity.entity_id)}
						<tr animate:flip={{ duration: flipDurationMs }}>
							<td>
								{combatant.entity.name}
							</td>
							<td>
								{combatant.entity.cr}
							</td>
							<td class="icons">
								<button on:click={(e) => changeCount(combatant.entity, -1)}>
									<Minus />
								</button>
								<span class="count">
									{combatant.count}
								</span>
								<button on:click={(e) => changeCount(combatant.entity, 1)}>
									<Plus />
								</button>
							</td>
							<td>
								<div class="aligncenter">
									<button on:click={() => removeCombatant(combatant.entity)}>
										<X />
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr><td colspan="4">Select combatants to add...</td></tr>
					{/each}
				</tbody>
			</table>
			{#if combatants.length > 0}
				<div class="startcombat" />
			{/if}
		{/if}
	</div>
</div>

<!-- <EntityBox bind:dialogVisible bind:this={entitybox} /> -->

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
	.description {
		min-width: 100%;
		display: grid;
		grid-template-columns: 1fr 5fr 2fr;
		align-items: center;
	}
	.description input {
		width: 100%;
	}
	.combatants table {
		width: 100%;
		/* display: grid; */
	}
	.startcombat {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
	.selected {
		background-color: var(--brand-background);
	}
	/* .icons {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		justify-items: center;
	} */
	.aligncenter {
		display: block;
		margin: auto;
	}
	.count {
		padding-inline: var(--size-4);
	}
</style>
