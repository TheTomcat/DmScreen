<script lang="ts">
	import EntityRow from '$lib/components/EntityRow.svelte';
	import { onMount } from 'svelte';

	import InputBox from '$lib/components/InputBox.svelte';
	import type { Entity, Participant, Combat } from '../../../app';

	import { Edit, Minus, Plus, PlusSquare, X } from 'lucide-svelte';
	import { apiAddParticipantToCombat, apiCreateCombat } from '$lib/api';
	import { debounce, roll } from '$lib';
	import { flip } from 'svelte/animate';
	import Modal from '$lib/components/Modal.svelte';
	import EntityBox from '$lib/components/EntityBox.svelte';
	import client from '$lib/api/index';
	import { toast } from '@zerodevx/svelte-toast';
	// import { loading } from '../../../../lib/stores/combatStore';

	//https://svelte.dev/repl/6fbaf2115a31423b9e5b989423dce38a?version=3.42.5 Shake animation

	let entityFilter: string = '';
	let loadingEntities: boolean = false;
	let loadingMoreEntities: boolean = false;
	let filteredEntities: Entity[] = [];
	let numResults: number = -1;
	let nextPage: number = -1;
	let showPCs: boolean = false;
	let showNPCs: boolean = true;
	let title: string;
	let useSmartNaming: boolean = false;

	let entityListDiv: HTMLElement;

	let combatants: { entity: Entity; count: number }[] = [];

	let flipDurationMs: number = 200;

	const getEntities = async (q: string, page: number = 1) => {
		return client.GET('/entity/', {
			params: {
				query: { name: q, page }
			}
		});
	};

	const _updateList = (search: string, page: number = 1, cb: Function) => {
		getEntities(search, page).then((response) => {
			if (!response.data) return;
			let isNextPage =
				(response.data?.page || 0) * (response.data?.size || 0) < (response.data?.total || 0);
			cb(response.data?.items, response.data?.total, isNextPage);
		});
	};

	const updateList = debounce(_updateList, 200);

	$: {
		if (entityFilter) {
			loadingEntities = true;
			updateList(entityFilter, 1, (entities: Entity[], results: number, isNextPage: boolean) => {
				filteredEntities = entities;
				numResults = results;
				loadingEntities = false;
				nextPage = isNextPage ? 2 : -1;
			});
		} else {
			filteredEntities = [];
		}
	}

	let handleScroll = (e: Event) => {
		if (entityListDiv.scrollTop + entityListDiv.clientHeight == entityListDiv.scrollHeight) {
			loadingMoreEntities = true;
			if (nextPage < 0) return;
			_updateList(
				entityFilter,
				nextPage,
				(entities: Entity[], results: number, isNextPage: boolean) => {
					filteredEntities = [...filteredEntities, ...entities];
					numResults += results;
					loadingMoreEntities = false;
					nextPage = isNextPage ? nextPage + 1 : -1;
				}
			);
		}
	};

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
		client
			.POST('/combat/', {
				body: {
					title,
					participants: combatants
						.map(({ entity, count }) =>
							Array.from(Array(count).keys()).map((i) => {
								return {
									name: entity.name,
									//useSmartNaming && count > 1
									//	? `@${entity.name}`
									//	: `${entity.name}${i > 0 ? ` ${i + 1}` : ''}`,
									entity_id: entity.entity_id,
									max_hp: roll(entity.hit_dice, 'default'),
									ac: entity.ac,
									initiative_modifier: entity.initiative_modifier,
									image_id: entity.image_id,
									is_PC: entity.is_PC,
									hit_dice: entity.hit_dice
								};
							})
						)
						.reduce((a, b) => a.concat(b))
				}
			})
			.then((response) => {
				if (response.data) {
					combatants = [];
					title = '';
					toast.push(`Combat created successfully: ${response.data.combat_id}`);
				}
			});
	};
</script>

<!-- {@debug combatants} -->
<h1>Combat Builder</h1>
<div>
	On this page, you can build the structure of an encounter. Select entities from the list on the
	left to add to the combat on the right. It doesn't matter if you change your mind, this page
	exists purely as a convenience. All the options can be changed on the <a href="">Combat Manager</a
	>
	page
</div>
<div class="container">
	<div class="entities">
		<div class="header">
			<h4>Add a monster:</h4>
			<InputBox bind:value={entityFilter} placeholder={'Filter...'} />
			Show:<button class:selected={showPCs} on:click={() => (showPCs = !showPCs)}>{'PCs'}</button>
			<button class:selected={showNPCs} on:click={() => (showNPCs = !showNPCs)}>{'NPCs'}</button>
			{numResults >= 0 ? `${numResults} results` : ''}
		</div>
		{#if filteredEntities}
			<div class="entitylist" bind:this={entityListDiv} on:scroll={handleScroll}>
				{#if loadingEntities}
					Loading...
				{:else}
					{#each filteredEntities.filter((entity) => (entity.is_PC && showPCs) || (!entity.is_PC && showNPCs)) as entity (entity.entity_id)}
						<EntityRow {entity}>
							<button on:click={addCombatant(entity)}><PlusSquare /></button>
						</EntityRow>
					{/each}
					{#if loadingMoreEntities}
						loading...
					{/if}
				{/if}
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
		<div>Use Smart Naming: <input type="checkbox" bind:checked={useSmartNaming} /></div>
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
		/* height: 100%; */
		padding: var(--size-3);
		margin: var(--size-3);
		border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8);
		column-gap: var(--size-3);
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
