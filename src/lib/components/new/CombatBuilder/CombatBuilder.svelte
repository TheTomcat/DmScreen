<script lang="ts">
	import type { AnyEntity, Combat, Entity, Participant, QuickEntity } from '../../../../app';

	import { Minus, Plus, PlusSquare, X } from 'lucide-svelte';

	import { roll } from '$lib';
	import { flip } from 'svelte/animate';
	import client from '$lib/api/index';
	import { toast } from 'svelte-sonner';
	//import { toast } from '@zerodevx/svelte-toast';
	// import Dialog from '$lib/components/Dialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Sheet from '$lib/components/ui/sheet';

	import DataTable from './entity-datatable.svelte';
	import ImageSelection from '$lib/components/ImageSelection.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import DataTableMetadata from '$lib/components/datatables/entities/data-table-metadata.svelte';
	import { createEventDispatcher } from 'svelte';

	//https://svelte.dev/repl/6fbaf2115a31423b9e5b989423dce38a?version=3.42.5 Shake animation

	const dispatch = createEventDispatcher<{
		newCombat: { combat: Combat };
	}>();

	let title: string;

	let quickAddOpen: boolean = false;
	let mainAddDialogOpen: boolean = false;
	let selectionOpen: boolean = false;

	let quickEntityId = -1;
	let quickEntity: QuickEntity = {
		name: '',
		initiative: 10,
		ac: 10,
		hit_points: 1,
		entity_id: -1,
		cr: undefined
	};

	export let combatants: { entity: AnyEntity; count: number }[] = [];

	let flipDurationMs: number = 200;

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
		// return () => {
		combatants = [...combatants, { entity, count: 1 }];
		// };
	};

	let quickAddCombatant = (combatant: QuickEntity) => {
		// return () => {
		combatants = [...combatants, { entity: { ...combatant, entity_id: quickEntityId }, count: 1 }];
		quickEntityId--;
		// TODO: Implement quick add
		// TODO: ?? get rid of the array combatants, and just make it a list?
		// };
	};

	let removeCombatant = (entity: AnyEntity) => {
		let index = combatants?.findIndex(
			(combatant) => combatant.entity.entity_id == entity.entity_id
		);
		if (index > -1) {
			combatants = [...combatants.slice(0, index), ...combatants.slice(index + 1)];
		}
	};

	let changeCount = (entity: AnyEntity, addor: number) => {
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
								if ('hit_points' in entity) {
									return {
										name: entity.name,
										max_hp: entity.hit_points,
										ac: entity.ac,
										initiative: entity.initiative,
										is_PC: false,
										image_id: entity.image_id
									};
								}
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
						.reduce((a, b) => a.concat(b)) // Flatten the array
				}
			})
			.then((response) => {
				if (response.data) {
					combatants = [];
					title = '';

					dispatch('newCombat', { combat: response.data });
				}
			});
	};

	const handleUpdate = (e: CustomEvent<{ returnValue: string }>) => {
		if (e.detail.returnValue == 'confirm') {
			quickAddCombatant(quickEntity);
		}
	};

	const selectEntity = (e: CustomEvent<{ entity: Entity }>) => {
		addCombatant(e.detail.entity);
		// mainAddDialogOpen = false;
	};

	const handleImageSelection = (e: CustomEvent) => {
		// let image_id = e.detail.imageData as number;
		quickEntity.image_id = e.detail.imageData;
		selectionOpen = false;
	};
	const openQuickAddDialog = () => {
		quickAddOpen = true;
		quickEntity = {
			name: '',
			initiative: 10,
			ac: 10,
			hit_points: 1,
			entity_id: -1,
			cr: undefined
		};
	};
</script>

<Dialog.Root bind:open={quickAddOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Quick add Combatant</Dialog.Title>
			<Dialog.Description
				>Create a combatant using the absolute minimum data. No frills!
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid grid-cols-2 gap-2 items-center">
			<Label for="name">Name</Label>
			<Input id="name" bind:value={quickEntity.name} />
			<Label for="ac">AC</Label>
			<Input id="ac" bind:value={quickEntity.ac} />
			<Label for="hp">HP</Label>
			<Input id="hp" bind:value={quickEntity.hit_points} />
			<Label for="init">Initiative</Label>
			<Input id="init" bind:value={quickEntity.initiative} />
			<div class="flex items-center justify-between gap-1">
				<Label for="image">Image</Label>
				({quickEntity.image_id})
			</div>
			<div class="flex items-center gap-1">
				<Button
					id="init"
					on:click={() => {
						selectionOpen = true;
					}}>Select Image</Button
				><Button
					disabled={quickEntity.image_id == undefined}
					variant="destructive"
					id="init"
					on:click={() => {
						delete quickEntity.image_id;
						quickEntity = quickEntity;
					}}><X class="w-4 h-4 mr-1" />Clear Image</Button
				>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				on:click={() => {
					quickAddOpen = false;
				}}
			>
				Close
			</Button>
			<Button
				on:click={() => {
					quickAddCombatant(quickEntity);
					quickAddOpen = false;
				}}
			>
				Add
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={mainAddDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Combatant</Dialog.Title>
			<Dialog.Description>Add a predefined combatant</Dialog.Description>
		</Dialog.Header>
		<DataTable on:selectEntity={selectEntity} />
		<Dialog.Footer>
			<Button
				on:click={() => {
					mainAddDialogOpen = false;
				}}>Close</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Sheet.Root bind:open={selectionOpen}>
	<Sheet.Content side="right" class="overflow-y-scroll sm:max-w-[100%]">
		<ImageSelection
			imageType={'character'}
			selectSingleImage={true}
			on:selection={handleImageSelection}
		/>
	</Sheet.Content>
</Sheet.Root>

<!-- {@debug combatants} -->
<div class="flex flex-col gap-2">
	<h1 class="text-xl mb-2">Combat Builder</h1>

	<div class="grid grid-cols-[3fr_1fr] gap-1 m-2 p-2">
		<Input bind:value={title} placeholder="You must enter a title" />
		<Button class="w-full" disabled={!title || !combatants.length} on:click={buildEncounter}>
			Create Combat
		</Button>
	</div>
	<!-- <div class="grid grid-cols-[auto_1fr] gap-1">
		<div class="entities rounded m-2 p-2 border">
			<DataTable on:selectEntity={selectEntity} />
		</div> -->
	<div class="combatants rounded m-2 p-2 border">
		<!-- <div>Use Smart Naming: <input type="checkbox" bind:checked={useSmartNaming} /></div> -->
		{#if combatants}
			<Table.Root>
				<!-- <Table.Caption>Combat Builder</Table.Caption> -->
				<Table.Header>
					<Table.Row>
						<Table.Head>Combatant</Table.Head>
						<Table.Head>CR</Table.Head>
						<Table.Head>Count</Table.Head>
						<Table.Head>Metadata</Table.Head>
						<Table.Head />
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each combatants as combatant (combatant.entity.entity_id)}
						<tr
							animate:flip={{ duration: flipDurationMs }}
							class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
						>
							<Table.Cell>
								{combatant.entity.name}
							</Table.Cell>
							<Table.Cell>
								{#if combatant.entity.cr}{combatant.entity.cr}{:else}-{/if}
							</Table.Cell>
							<Table.Cell class="icons flex flex-row items-center justify-between">
								<Button on:click={(e) => changeCount(combatant.entity, -1)} class="p-2 h-[unset]">
									<Minus class="w-4 h-4" />
								</Button>
								<span class="count">
									{combatant.count}
								</span>
								<Button on:click={(e) => changeCount(combatant.entity, 1)} class="p-2 h-[unset]">
									<Plus class="w-4 h-4" />
								</Button>
							</Table.Cell>
							<Table.Cell>
								{#if combatant.entity}
									<DataTableMetadata entity={combatant.entity} />
									<!-- {:else}
									{JSON.stringify(combatant.entity)} -->
								{/if}
							</Table.Cell>
							<Table.Cell>
								<div class="aligncenter">
									<Button on:click={() => removeCombatant(combatant.entity)} class="p-2 h-[unset]">
										<X class="w-4 h-4" />
									</Button>
								</div>
							</Table.Cell>
						</tr>
					{:else}
						<Table.Row>
							<Table.Cell colspan={4}>Select combatants to add...</Table.Cell>
						</Table.Row>
					{/each}
					<Table.Row>
						<Table.Cell colspan={5}>
							<div class="flex flex-row justify-between gap-2 w-full">
								<Button class="w-full" variant="outline" on:click={openQuickAddDialog}>
									<PlusSquare class="h-4 w-4 mr-1" />Quick Add
								</Button>
								<Button
									class="w-full"
									variant="outline"
									on:click={() => {
										mainAddDialogOpen = true;
									}}
								>
									<PlusSquare class="h-4 w-4 mr-1" />Add From Database
								</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		{/if}
	</div>
</div>

<!-- </div> -->

<!-- <EntityBox bind:dialogVisible bind:this={entitybox} /> -->

<style>
	.information {
		display: grid;
		grid-template-columns: var(--size-fluid-3) 1fr;
		gap: var(--size-3);
		align-items: center;
	}
	.container {
		display: grid;
		grid-template-columns: auto 1fr;
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
		max-height: 45vh;
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
