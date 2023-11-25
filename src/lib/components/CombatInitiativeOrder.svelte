<script lang="ts">
	import {
		sort_participants_naive,
		smartName,
		is_dead,
		roll,
		remainingHp,
		remainingHpPercent
	} from '$lib';
	import { flip } from 'svelte/animate';
	import {
		CrossIcon,
		CrownIcon,
		Dice1,
		Dices,
		Droplets,
		Eye,
		EyeOff,
		PlusSquare,
		Rat,
		RefreshCw,
		RefreshCwOff,
		Skull,
		SwordsIcon
	} from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import type { Participant, Entity, Combat } from '../../app';
	import client from '$lib/api/index';
	import { playerStateStore, combat } from '$lib/ws';

	import tippy from 'svelte-tippy';
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import type { wsController } from '$lib/ws';
	import Autocomplete from './Autocomplete.svelte';

	// type Participant = components['schemas']['Participant'];
	// type Combat = components['schemas']['Combat'];
	export let playerView: boolean = true;
	export let controller: wsController;
	export let manualUpdate: boolean = false;

	let dialog: HTMLDialogElement;
	let showModal: boolean = false;
	let damaging_participant: Participant | undefined;
	let damaging: boolean = true;
	let damageAmount: number = 0;
	let damageInputField: HTMLInputElement;

	const getEntities = async (q: string) => {
		return client.GET('/entity/', { params: { query: { name: q, size: 15 } } }).then((response) => {
			if (!response.data) return [];
			return response.data.items;
		});
	};
	const extractId = (t: Entity): number => t.entity_id;
	const extractName = (t: Entity): string => t.name || '';
	const addNewCombatant = (e: CustomEvent<Entity>) => {
		console.log(e);
	};
	const addNewQuickCombatant = (e: CustomEvent<{ value: string }>) => {
		console.log(e);
	};
</script>

<table style="width: 100%; border-spacing: 0;">
	<thead>
		<th><div class="icon"><Dices /></div></th>
		<th />
		{#if !playerView}<th />{/if}
		<th>Name</th>
		<th />
		<th><div class="icon"><Droplets color="red" /></div></th>
	</thead>
	<tbody>
		{#if $combat && $combat.participants}
			{#each $combat.participants //combat.participants
				.filter((p) => p.is_visible || !playerView)
				.toSorted(sort_participants_naive) as participant, i (participant.participant_id)}
				<tr
					animate:flip
					class:activeparticipant={participant.participant_id == $combat.active_participant_id}
				>
					<td>{!$combat.is_active ? '-' : participant.initiative}</td>

					<td
						><div style="display: flex; flex-direction: row; justify-content: center;">
							<span
								class="circle"
								style={`background: ${participant.colour || 'unset'}; float: left;`}
							/>
						</div>
					</td>
					{#if !playerView}
						<td
							><div style="display: flex; flex-direction: row; justify-content: center;">
								<span
									class="icon"
									style="position: relative; right: 0;"
									on:click={() =>
										controller.setIsVisible(participant.participant_id, !participant.is_visible)}
								>
									{#if participant.is_visible}<Eye />{:else}<EyeOff />{/if}
								</span>
								<span
									class="icon"
									style="position: relative; right: 0;"
									on:click={() =>
										controller.setHasReaction(
											participant.participant_id,
											!participant.has_reaction
										)}
								>
									{#if participant.has_reaction}<RefreshCw />{:else}<RefreshCwOff />{/if}
								</span>
							</div>
						</td>
					{/if}
					<td>
						<!-- {#if playerView} -->
						<span class:dead={is_dead(participant)} class:player={participant.is_PC}>
							{smartName(participant.participant_id, $combat.participants /*combat.participants*/)}
						</span>
						<!-- {:else}
						<EditableText
							value={participant.name}
							callback={(name) => setName(participant.participant_id, name)}
						/>
					{/if} -->
					</td>
					<td
						><div style="display:flex; justify-content: end; gap: var(--size-3)">
							{#if is_dead(participant)}<div class="icon">
									<Skull />
								</div>{/if}{#each participant.conditions.split(',') as condition}{condition}{/each}
							{#if playerView}
								<span class="icon" style="position: relative; right: 0;">
									{#if participant.has_reaction}<RefreshCw />{:else}<RefreshCwOff />{/if}
								</span>
							{/if}
						</div>
					</td>
					{#if playerView}
						<td>{participant.damage}</td>
					{:else if $combat.is_active}
						<td
							><div class="damage">
								<button
									on:click={() => {
										damaging = true;
										damageAmount = 0;
										damaging_participant = participant;
										showModal = true;
									}}
								>
									<SwordsIcon color={'red'} />
								</button>
								<div class="hitpoints">
									{remainingHp(participant)}/{participant.max_hp}
									<span class="fullhp">
										<span class="remaininghp" style="width: {remainingHpPercent(participant)}%" />
									</span>
								</div>
								<button
									on:click={() => {
										damaging = false;
										damageAmount = 0;
										damaging_participant = participant;
										showModal = true;
									}}
								>
									<CrossIcon color={'green'} />
								</button>
							</div>
						</td>
					{:else}
						<td
							>{participant.max_hp}
							<button on:click={() => controller.setMaxHP(participant.participant_id, 1)}
								>One</button
							>
							<button on:click={() => controller.setMaxHP(participant.participant_id, 1)}
								>Min</button
							>
							<button on:click={() => controller.setMaxHP(participant.participant_id, 1)}
								>Avg</button
							>
							<button on:click={() => controller.setMaxHP(participant.participant_id, 1)}
								>Random</button
							>
							<button on:click={() => controller.setMaxHP(participant.participant_id, 1)}
								>Max</button
							>
						</td>
					{/if}
				</tr>
			{/each}
		{/if}
	</tbody>
	<tfoot>
		<tr
			><td colspan="3">Add Combatant</td>
			<td colspan="2"
				><Autocomplete
					getData={getEntities}
					{extractId}
					{extractName}
					on:submititem={addNewCombatant}
					on:submitnew={addNewQuickCombatant}
					allowCreation={false}
					placeholder={'Search for a Combatant'}
				/></td
			>
			<td><button><PlusSquare />Quick-add combatant</button></td>
		</tr>
	</tfoot>
</table>
<!-- <div>
	{#if !playerView}{/if}
</div> -->
{#if !playerView}
	<Modal bind:dialog bind:showModal params={{ allowCasualDismiss: true, showClose: false }}>
		{#if damaging_participant && damaging_participant.participant_id}
			<h5>Apply {`${damaging ? 'damage' : 'healing'}`} to {damaging_participant.name}</h5>
			<input
				placeholder={`Apply ${damaging ? 'damage' : 'healing'}`}
				bind:value={damageAmount}
				bind:this={damageInputField}
			/><button
				on:click={() => {
					if (damageAmount != 0) {
						let damage = (damaging ? 1 : -1) * damageAmount + (damaging_participant?.damage || 0);
						if (damage > damaging_participant.max_hp) damage = damaging_participant.max_hp;
						if (damage < 0) damage = 0;
						controller.setDamage(damaging_participant?.participant_id, damage);
					}
					dialog.close();
				}}>{`Apply ${damaging ? 'damage' : 'healing'}`}</button
			>
		{/if}
	</Modal>
{/if}

<!-- <Modal bind:damageDialog bind:showDamageModal params={{ allowCasualDismiss: true, showClose: false }} /> -->

<style>
	.activeparticipant {
		background: linear-gradient(70deg, #334, #777);
		background-size: 400% 400%;
		animation: gradient 5s ease infinite;
		background-color: transparent;
	}
	.activeparticipant td {
		background: unset;
		border: 0;
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
		width: 100%;
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
		width: var(--size-10);
	}
</style>
