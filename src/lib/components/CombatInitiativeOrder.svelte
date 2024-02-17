<script lang="ts">
	import {
		sort_participants_naive,
		is_dead,
		remainingHp,
		remainingHpPercent,
		roll,
		rollDice,
		get_next_alive_participant_id,
		capitalise,
		is_active
	} from '$lib';
	import { flip } from 'svelte/animate';
	import {
		CrossIcon,
		Dices,
		Droplets,
		Eye,
		EyeOff,
		MessageSquareCode,
		Pencil,
		PlusSquare,
		RefreshCw,
		RefreshCwOff,
		Shield,
		Skull,
		SwordsIcon,
		Trash2,
		X
	} from 'lucide-svelte';
	import type { Participant, Entity, Combat } from '../../app';
	import client from '$lib/api/index';
	import { combat } from '$lib/ws';
	import * as Popover from '$lib/components/ui/popover';
	import * as Dialog from '$lib/components/ui/dialog';

	import { Button } from '$lib/components/ui/button';
	import { createEventDispatcher, onDestroy, tick } from 'svelte';
	import type { wsController } from '$lib/ws';
	import Autocomplete from './Autocomplete.svelte';
	import EditableText from './EditableText.svelte';

	import { entityHasData, parseAndCreateCounters } from '$lib/jsonschema';
	import Statblock from './new/EntityDisplay/Statblock.svelte';

	import * as Table from '$lib/components/ui/table';
	import { cn } from '$lib/utils';

	// type Participant = components['schemas']['Participant'];
	// type Combat = components['schemas']['Combat'];

	export let controller: wsController;

	const dispatch = createEventDispatcher<{
		combat_updated: { combat: Combat };
	}>();

	// let damageDialog: Dialog;
	let damaging_participant: Participant | undefined;
	let damaging: boolean = true;
	let damageAmount: number = 0;
	let damageInputField: HTMLInputElement;
	let popoverOpen = false;
	let popoverTarget: HTMLButtonElement;

	// let conditionsDialog: Dialog2;
	let conditionsDialogOpen: boolean = false;
	let conditions_parcipitant: Participant | undefined;
	let conditionInputField: HTMLInputElement;
	let conditionsChanged: boolean = false;
	let conditionToAdd: string = '';
	let conditions: string[] = [];

	let entities: Entity[] = [];
	let statblockParticipant: Participant;
	let statblockEntity: Entity;
	// let statblockDialog: Dialog2
	let statblockDialogOpen: boolean = false;

	const Conditions = [
		'Blinded',
		'Charmed',
		'Deafened',
		'Frightened',
		'Incapacitated',
		'Grappled',
		'Invisible',
		'Paralysed',
		'Poisoned',
		'Prone',
		'Restrained',
		'Stunned',
		'Exhausted'
	];

	const getUniqueEntityIds = (combat: Combat): number[] => {
		// @ts-ignore
		return [...new Set(combat.participants.map((p) => p.entity_id) || [])].filter((n) => n);
	};

	const loadEntitiesFromCombat = (combat: Combat) => {
		if (!combat) return;
		// return .map(entity_id => getEntity(entity_id)).filter(n=>n)

		getUniqueEntityIds(combat).forEach((entity_id) => {
			getEntity(entity_id).then((response) => {
				if (response && entityHasData(response)) {
					entities = [...entities, response];
				}
			});
		});
	};

	const participantHasEntityData = (p: Participant): boolean => {
		if (!p.entity_id) return false;
		if (!entities) return false;
		// console.log(entities);
		return !!entities.find((e) => {
			return e.entity_id === p.entity_id; //&& entityHasData(e);
		});
	};

	const getEntities = async (q: string) => {
		return client.GET('/entity/', { params: { query: { name: q, size: 15 } } }).then((response) => {
			if (!response.data) return [];
			return response.data.items;
		});
	};
	const getEntity = async (entity_id: number) => {
		return (
			client
				.GET('/entity/{entity_id}', { params: { path: { entity_id } } })
				// @ts-ignore
				.then((response) => {
					if (!response.data) return;
					return { ...response.data, data: JSON.parse(response.data?.data || '{}') };
				})
		);
	};
	const extractId = (t: Entity): number => t.entity_id;
	const extractName = (t: Entity): string => (t.image_id !== null ? '+' : '') + t.name || '';
	const addNewCombatant = (e: CustomEvent<Entity>) => {
		if (!$combat) return;
		console.log($combat.combat_id, e.detail);
		controller.addParticipantFromEntity($combat.combat_id, e.detail);
		// console.log(e);
	};
	const addNewQuickCombatant = (e: CustomEvent<{ value: string }>) => {
		// console.log(e);
	};
	const showDamagingDialog = (
		damagingMode: boolean,
		participant: Participant,
		target: HTMLButtonElement
	) => {
		damaging = damagingMode;
		damageAmount = 0;
		damaging_participant = participant;
		// showModal = true;
		popoverTarget = target;
		console.log(popoverTarget);
		popoverOpen = true;
		// damageDialog.open();
		// tick().then(() => damageInputField.focus());
	};
	const applyDamage = () => {
		if (damageAmount != 0) {
			if (!damaging_participant) return;
			if (!damaging_participant.max_hp) return;
			let damage = (damaging ? 1 : -1) * damageAmount + (damaging_participant?.damage || 0);
			if (damage > damaging_participant?.max_hp || 0) damage = damaging_participant.max_hp;
			if (damage < 0) damage = 0;
			//if (!damaging_participant || !damaging_participant.participant_id) return;
			controller.setDamage(damaging_participant?.participant_id, damage).then(() => {
				if (!$combat) return;
				dispatch('combat_updated', { combat: $combat });
			});
		}
		// damageDialog.close();
		popoverOpen = false;
	};
	const showConditionsDialog = (participant: Participant) => {
		conditions_parcipitant = participant;
		conditions = conditions_parcipitant.conditions.split(',').filter((s) => s);
		conditionToAdd = '';
		conditionsChanged = false;
		// conditionsDialog.open();
		conditionsDialogOpen = true;
		tick().then(() => conditionInputField.focus());
	};
	const showStatblockDialog = (participant: Participant) => {
		statblockParticipant = participant;
		let index = entities.findIndex((e) => e.entity_id == participant.entity_id);
		if (index == -1) return;
		console.log('going');
		statblockEntity = entities[index];
		// statblockDialog.open();
		statblockDialogOpen = true;
	};
	const setConditions = () => {
		console.log(conditions);
		if (conditionsChanged) {
			if (!conditions_parcipitant) return;
			controller.setConditions(conditions_parcipitant.participant_id, conditions).then(() => {
				if (!$combat) return;
				dispatch('combat_updated', { combat: $combat });
			});
		}
		// conditionsDialog.close();
		conditionsDialogOpen = false;
	};
	const onDamageKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			console.log(e.key);
			applyDamage();
		}
	};

	let unsubscribe = combat.subscribe((value) => {
		if (value) loadEntitiesFromCombat(value);
	});

	onDestroy(unsubscribe);

	$: {
		if (entities && $combat && $combat.participants)
			parseAndCreateCounters($combat?.participants, entities);
	}

	let refs: HTMLButtonElement[] = [];
</script>

<Table.Root style="width: 100%; border-spacing: 0;">
	<Table.Header>
		<Table.Row>
			<Table.Head class="flex justify-center items-center"><Dices /></Table.Head>
			<Table.Head><Shield /></Table.Head>
			<!-- <Table.Head /> -->
			<Table.Head />
			<Table.Head />
			<Table.Head>
				Name
				<Button class="p-2 ml-1 h-8" variant="outline">Smart Name</Button>
			</Table.Head>
			<Table.Head class="flex justify-center items-center"><Droplets color="red" /></Table.Head>
			<Table.Head>Conditions</Table.Head>
			<Table.Head />
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#if $combat && $combat.participants}
			{#each $combat.participants //combat.participants
				//.filter((p) => p.is_visible || !playerView)
				.toSorted(sort_participants_naive) as participant, i (participant.participant_id)}
				<tr
					animate:flip
					class={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', {
						activeparticipant: participant.participant_id == $combat.active_participant_id,
						isHidden: !participant.is_visible,
						PC: participant.is_PC,
						NPC: !participant.is_PC
					})}
				>
					<Table.Cell>
						{#if $combat.is_active}
							<EditableText
								value={`${participant.initiative}`}
								callback={(v) => {
									return controller
										.setInitiative(participant.participant_id, parseInt(v))
										.then(() => {
											if (!$combat) return;
											dispatch('combat_updated', { combat: $combat });
										});
								}}
							/>
						{:else}
							-
						{/if}
					</Table.Cell>
					<Table.Cell>
						<EditableText
							value={`${participant.ac}`}
							callback={(v) => {
								return controller.setAC(participant.participant_id, parseInt(v)).then(() => {
									if (!$combat) return;
									dispatch('combat_updated', { combat: $combat });
								});
							}}
						/>
					</Table.Cell>
					<!-- <Table.Cell>
						<div class="flex flex-row justify-center">
							<span
								class="circle"
								style={`background: ${participant.colour || 'unset'}; float: left;`}
							/>
						</div>
					</Table.Cell> -->

					<Table.Cell>
						<div class="flex flex-row justify-center">
							<button
								class="icon"
								on:click={() => {
									controller
										.setIsVisible(participant.participant_id, !participant.is_visible)
										.then(() => {
											if (!$combat) return;
											dispatch('combat_updated', { combat: $combat });
										});
								}}
							>
								{#if participant.is_visible}<Eye />{:else}<EyeOff color={'grey'} />{/if}
							</button>
							<button
								class="icon"
								style="position: relative; right: 0;"
								on:click={() => {
									controller
										.setHasReaction(participant.participant_id, !participant.has_reaction)
										.then(() => {
											if (!$combat) return;
											dispatch('combat_updated', { combat: $combat });
										});
								}}
							>
								{#if participant.has_reaction}<RefreshCw
										color={'forestgreen'}
									/>{:else}<RefreshCwOff color={'maroon'} />{/if}
							</button>
						</div>
					</Table.Cell>
					<Table.Cell>
						<!-- {#await Promise.all(loadEntitiesFromCombat($combat)) then } 
							 -->
						{#if entities && participantHasEntityData(participant)}
							<button class="icon" on:click={() => showStatblockDialog(participant)}>
								<MessageSquareCode class="h-4 w-4 mr-1" />
							</button>
						{/if}
					</Table.Cell>
					<Table.Cell>
						<span class:dead={is_dead(participant)} class:player={participant.is_PC}>
							<EditableText
								value={participant.name}
								callback={(v) => {
									return controller.setName(participant.participant_id, v).then(() => {
										if (!$combat) return;
										dispatch('combat_updated', { combat: $combat });
									});
								}}
							/>
						</span>
					</Table.Cell>
					<Table.Cell class="flex justify-center">
						<div class="grid grid-cols-[1fr,3fr,1fr] gap-1">
							<Button
								bind:el={refs[i]}
								variant="ghost"
								class="h-8 m-0 p-2"
								on:click={() => showDamagingDialog(true, participant, refs[i])}
							>
								<SwordsIcon class="h-4 w-4" color={'red'} />
							</Button>
							<div class="text-center">
								<!-- <EditableText
									value={`${remainingHp(participant)}`}
									callback={(v) => {
										return controller
											.setDamage(participant.participant_id, participant.max_hp || 1 - parseInt(v))
											.then(() => {
												if (!$combat) return;
												dispatch('combat_updated', { combat: $combat });
											});
									}}
								/> -->
								{remainingHp(participant)}
								/
								<EditableText
									value={`${participant.max_hp}`}
									callback={(v) => {
										return controller.setMaxHP(participant.participant_id, parseInt(v)).then(() => {
											if (!$combat) return;
											dispatch('combat_updated', { combat: $combat });
										});
									}}
								/>
								<span class="fullhp">
									<span class="remaininghp" style="width: {remainingHpPercent(participant)}%" />
								</span>
							</div>
							<Button
								variant="ghost"
								class="h-8 m-0 p-2"
								on:click={() => showDamagingDialog(false, participant, refs[i])}
							>
								<CrossIcon class="w-4 h-4" color={'green'} />
							</Button>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex justify-start gap-2">
							<Button
								on:click={() => {
									showConditionsDialog(participant);
								}}
								class="h-8 m-0 p-2"
								variant="outline"><Pencil class="w-4 h-4" /></Button
							>
							{#if is_dead(participant)}<div class="icon">
									<Skull />
								</div>
							{/if}
							{participant.conditions.split(',').join(', ')}
							<!-- {#each participant.conditions.split(',') as condition}{condition}{/each} -->
						</div>
					</Table.Cell>

					<Table.Cell>
						<Button
							variant="ghost"
							class="h-8 m-0 p-2"
							on:click={() => {
								if ($combat?.active_participant_id == participant.participant_id) {
									let p = get_next_alive_participant_id(
										$combat?.active_participant_id,
										$combat?.participants
									);
									if (p.have_looped) {
									}
									controller.advanceCombat({
										...p
									});
									controller.removeParticipant(participant.participant_id);
								} else {
									controller.removeParticipant(participant.participant_id);
								}
							}}
						>
							<Trash2 class="w-4 h-4" />
						</Button>
					</Table.Cell>
				</tr>
			{/each}
		{/if}
	</Table.Body>
	<Table.Footer>
		<Table.Row
			><Table.Cell colspan={3}>Add Combatant</Table.Cell>
			<Table.Cell colspan={4}
				><Autocomplete
					getData={getEntities}
					{extractId}
					{extractName}
					on:submititem={addNewCombatant}
					on:submitnew={addNewQuickCombatant}
					allowCreation={false}
					placeholder={'Search for a Combatant'}
				/></Table.Cell
			>
			<Table.Cell colspan={2}><button><PlusSquare />Quick-add combatant</button></Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>
<!-- {JSON.stringify(entities)} -->
<!-- <Dialog mode="mega" showMenu={false} bind:this={statblockDialog}>
</Dialog> -->

<Statblock
	bind:dialogOpen={statblockDialogOpen}
	entity={statblockEntity}
	participant={statblockParticipant}
/>

<Dialog.Root bind:open={popoverOpen}>
	<!-- <Popover.Trigger bind:el={popoverTarget}>t</Popover.Trigger> -->
	<Dialog.Content class="overflow-scroll">
		{#if damaging_participant && damaging_participant.participant_id}
			<Dialog.Header>
				<h5>Apply {`${damaging ? 'damage' : 'healing'}`} to {damaging_participant.name}</h5>
			</Dialog.Header>
			<div class="flex gap-2">
				<!-- <h5>Apply {`${damaging ? 'damage' : 'healing'}`} to {damaging_participant.name}</h5> -->
				<input
					class="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder={`Apply ${damaging ? 'damage' : 'healing'}`}
					bind:value={damageAmount}
					bind:this={damageInputField}
					on:keydown={onDamageKeyDown}
				/>
				{#if damaging}
					<Button on:click={applyDamage}><SwordsIcon color={'red'} />Apply Damage</Button>
				{:else}
					<Button on:click={applyDamage}><CrossIcon color={'green'} />Apply Healing</Button>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- <Dialog mode="mega" showMenu={false} bind:this={damageDialog}>
	<div slot="content">
		{#if damaging_participant && damaging_participant.participant_id}
			<h5>Apply {`${damaging ? 'damage' : 'healing'}`} to {damaging_participant.name}</h5>
			<input
				placeholder={`Apply ${damaging ? 'damage' : 'healing'}`}
				bind:value={damageAmount}
				bind:this={damageInputField}
				on:keydown={onDamageKeyDown}
			/>
			{#if damaging}
				<button on:click={applyDamage}><SwordsIcon color={'red'} />Apply Damage</button>
			{:else}
				<button on:click={applyDamage}><CrossIcon color={'green'} />Apply Healing</button>
			{/if}
		{/if}
	</div>
</Dialog> -->

<!-- <Dialog mode="mega" showMenu={false} bind:this={conditionsDialog}> -->
<Dialog.Root bind:open={conditionsDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Conditions</Dialog.Title>
			<Dialog.Description>
				{#if conditions_parcipitant}
					<h5>Apply condition to {conditions_parcipitant.name}</h5>
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		{#if conditions_parcipitant && conditions_parcipitant.participant_id}
			<div style="height: 300px;">
				<div>
					{#each conditions as condition}
						<div
							style="display: flex; flex-direction: row; justify-content: start;"
							on:click={() => {
								conditions = conditions.filter((c) => c !== condition);
								conditionsChanged = true;
							}}
							on:keyup={() => {
								conditions = conditions.filter((c) => c !== condition);
								conditionsChanged = true;
							}}
							role="button"
							tabindex="0"
						>
							{capitalise(condition)}<span style="padding-left: var(--size-1);"><X /></span>
						</div>
					{/each}
				</div>
				<Autocomplete
					allItems={Conditions}
					debounceTime={0}
					placeholder="Apply Condition"
					extractName={(s) => s}
					extractId={(s) => s}
					allowCreation={true}
					bind:searchInput={conditionInputField}
					on:submititem={(s) => {
						console.log(s);
						if (!conditions_parcipitant) return;
						if (s.detail === '') return;
						conditions = [...conditions, s.detail.toLowerCase()];
						conditionToAdd = '';
						conditionsChanged = true;
					}}
					on:submitnew={(s) => {
						console.log(s);
						if (!conditions_parcipitant) return;
						if (s.detail.value === '') return;
						conditions = [...conditions, s.detail.value.toLowerCase()];
						conditionToAdd = '';
						conditionsChanged = true;
					}}
					on:emptysubmit={() => {
						setConditions();
						// conditionsDialog.close();
						conditionsDialogOpen = false;
					}}
				/>
			</div>
		{/if}
		<Dialog.Footer>
			<Button on:click={setConditions}>Set</Button>
			<Button
				variant="destructive"
				on:click={() => {
					conditionsDialogOpen = false;
				}}>Cancel</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* table.inactive * {
		pointer-events: none;
		opacity: 0.7;
		background-color: #777;
	} */
	/* tr.PC {
		background: linear-gradient(45deg, #353, #797);
		animation: gra 5s ease infinite;
		background-size: 200% 200%;
	}
	tr.PC > td {
		background: unset;
	} */
	tr.activeparticipant {
		background: linear-gradient(70deg, #334, #777);
		background-size: 200% 200%;
		animation: gra 5s ease infinite;
		background-color: transparent;
		/* border: 2px solid red; */
	}
	tr.isHidden {
		background-color: #011;
	}
	tr.isHidden > td {
		background: unset;
	}
	tr.activeparticipant > td {
		background: unset;
	}
	tr:last-of-type {
		border-bottom-left-radius: var(--radius-3);
		border-bottom-right-radius: var(--radius-3);
	}
	tr:last-of-type td:first-child {
		border-bottom-left-radius: var(--radius-3);
	}
	tr:last-of-type td:last-of-type {
		border-bottom-right-radius: var(--radius-3);
	}

	.icon {
		display: flex;
		justify-content: center;
		padding: unset;
		background: unset;
		border: unset;
		box-shadow: unset;
	}
	.circle {
		position: relative;

		right: 0;
		border-radius: 50%;
		margin: var(--size-1);
		height: var(--size-3);
		width: var(--size-3);
		transform: scale(1);
		/* background: rgba(255, 177, 66, 1); */
		border: solid 1px var(--text-2);
		box-shadow: var(--shadow-2);
	}
	.dead {
		text-decoration: line-through;
		color: var(--gray-7);
	}
	.player {
		color: var(--success);
	}
	.damage {
		display: grid;
		grid-template-columns: var(--size-8) var(--size-10) var(--size-8);
		column-gap: var(--size-2);
		/* justify-content: space-between; */
		align-items: center;
		/* width: 100%; */
		white-space: nowrap;
		margin: auto;
	}
	.damage button {
		padding: var(--size-1);
	}
	.fullhp {
		display: block;
		height: 3px;
		background: #c00;
		text-align: left;
		position: relative;
		margin-bottom: -3px;
	}
	.remaininghp {
		display: inline-block;
		height: inherit;
		background: #0c0;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		transition: width 0.5s;
	}
	.hitpoints {
		display: inline;
		width: var(--size-10);
	}
	@keyframes gra {
		0% {
			background-position: 0% 45%;
		}
		50% {
			background-position: 100% 56%;
		}
		100% {
			background-position: 0% 45%;
		}
	}
</style>
