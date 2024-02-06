<script lang="ts">
	import { onMount } from 'svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';

	import * as Dialog from '$lib/components/ui/dialog';
	import { createEventDispatcher } from 'svelte';
	import { DicesIcon, Droplets } from 'lucide-svelte';
	import type { components } from '$lib/api/v1';
	import { roll_dice, sort_participants_naive } from '$lib';
	// import Dialog from './../Dialog.svelte';
	import InitiativeRow from './../InitiativeRow.svelte';
	import HitPointRow from './HitPointRow.svelte';

	const dispatch = createEventDispatcher<{
		changeParticipant: { participants: PartialParticipant[] };
		changeParticipantNames: { participants: { participant_id: number; name: string }[] };
		setInitiatives: {};
		submitForm: {};
	}>();

	type Participant = components['schemas']['Participant'];

	let participants: Participant[] = [];
	// let dialog: Dialog;
	// export let step: 'initiative' | 'hp' = 'hp';
	let dialogOpen: boolean = false;

	type Initiative = {
		participant_id: number;
		initiative: number;
		initiative_modifier: number;
	};
	// type HitPoints = { participant_id: number; max_hp: number; damage: number };
	type PartialParticipant = Initiative; //| HitPoints | (Initiative & HitPoints);
	let updated_participants: PartialParticipant[] = [];

	export const open = (new_participants: Participant[]) => {
		participants = [...new_participants];
		updated_participants = [];
		// dialog.open();
		dialogOpen = true;
	};

	const updateParticipants = (partial_participants: PartialParticipant[]) => {
		participants = participants.map((p) => {
			let partial_participant = partial_participants.find(
				(pp) => pp.participant_id === p.participant_id
			);
			// @ts-ignore This is because of a hack that I implemented in the backend, where data is sometimes present and sometimes not.
			// Ideally, when this function is called, participant.data should not be present.
			// delete updated_participant?.data;
			delete partial_participant?.data;
			if (partial_participant) {
				return { ...p, ...partial_participant };
			} else {
				return p;
			}
		});
		dispatch('changeParticipant', { participants: updated_participants });
	};

	const updateInitiative = (
		participant_id: number,
		initiative: number,
		initiative_modifier: number = 0
	) => {
		if (updated_participants.find((p) => p.participant_id === participant_id)) {
			updated_participants = updated_participants.map((up) => {
				if (up.participant_id === participant_id) {
					return { ...up, initiative, initiative_modifier };
				}
				return up;
			});
		} else {
			updated_participants = [
				...updated_participants,
				{ participant_id, initiative, initiative_modifier }
			];
		}
		dispatch('setInitiatives', {});
	};

	const onUpdateInitiative = (e: CustomEvent) => {
		updateInitiative(e.detail.participant_id, e.detail.initiative, e.detail.initiative_modifier);
		updateParticipants([
			{
				participant_id: e.detail.participant_id,
				initiative: e.detail.initiative,
				initiative_modifier: e.detail.initiative_modifier
			}
		]);
	};

	const rollInitiative = () => {
		participants.forEach((p) =>
			updateInitiative(
				p.participant_id,
				p.initiative_modifier ? p.initiative_modifier + roll_dice(20) : roll_dice(20),
				p.initiative_modifier
			)
		);
		updateParticipants(updated_participants);
	};

	const smartName = () => {
		let i = participants.toSorted(sort_participants_naive).map((participant) => {
			if (!participant.is_visible) {
				return { participant_id: participant.participant_id, name: participant.name };
			}
			// Get every participant with the same name
			let sameNames = participants
				.filter((p) => p.name == participant.name && p.is_visible)
				.toSorted(sort_participants_naive);
			if (sameNames.length == 1) {
				return { participant_id: participant.participant_id, name: participant.name };
			}
			let myPosition = sameNames.findIndex((p) => p.participant_id == participant.participant_id);
			return {
				participant_id: participant.participant_id,
				name: `${participant.name} ${myPosition + 1}`
			};
			// console.log();
		});
		console.log(i);
		dispatch('changeParticipantNames', { participants: i });
	};

	const submit = () => {
		// dispatch('changeParticipant', { participants: updated_participants });
		dispatch('submitForm', {});
		dialogOpen = false;
	};
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[50%] mx-5 overflow-hidden">
		<Dialog.Header>
			<!-- <Dialog mode="mega" bind:this={dialog}>
	<section slot="header"> -->
			<div class="flex gap-2">
				<DicesIcon class="h-8 w-8 mr-3" />
				<h3 class="text-xl">Roll Initiative</h3>
			</div>
			<!-- </section> -->
		</Dialog.Header>

		<div class="content">
			<!-- slot="content"> -->
			<!-- {#if step == 'initiative'} -->
			<div class="initiativebox">
				<!-- <div class="PCs"> -->
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Cell colspan={4}>PCs</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Roll</Table.Head>
							<Table.Head colspan={2}>Initiative</Table.Head>
						</Table.Row>
					</Table.Header>
					<!-- <thead><th colspan="3">PCs</th></thead>
					<thead><th>Name</th><th>Roll</th><th>Initiative</th></thead> -->
					{#each participants as participant (participant.participant_id)}
						{#if participant.is_PC}
							<Table.Row>
								<InitiativeRow bind:participant on:initiative_update={onUpdateInitiative} />
							</Table.Row>
						{/if}
					{/each}
					<Table.Header>
						<Table.Row>
							<Table.Cell colspan={4}>PCs</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Roll</Table.Head>
							<Table.Head colspan={2}>Initiative</Table.Head>
						</Table.Row>
					</Table.Header>
					<!-- <thead><th colspan="3">NPCs</th></thead>
					<thead><th>Name</th><th>Roll</th><th>Initiative</th></thead> -->
					{#each participants as participant (participant.participant_id)}
						{#if !participant.is_PC}
							<Table.Row>
								<InitiativeRow bind:participant on:initiative_update={onUpdateInitiative} />
							</Table.Row>
						{/if}
					{/each}
				</Table.Root>
			</div>
		</div>
		<Dialog.Footer>
			<div class="flex justify-between gap-2">
				<!-- slot="menu"> -->

				<Button variant="secondary" on:click={rollInitiative}
					><DicesIcon class="w-4 h-4 mr-1" />Roll all</Button
				>
				<Button on:click={submit}>Submit</Button>
				<!-- <button
					on:click={() => {
						// smartName();
						console.error('This does not yet work');
						submit();
					}}>Submit and AutoName</button
				> -->
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- </Dialog> -->

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
		/* min-width: 800px; */
		/* max-height: 500px; */
		display: grid;
		grid-template-columns: 1fr;
		justify-content: start;
		align-items: start;
		column-gap: var(--size-2);
	}
	.PCs,
	.NPCs {
		display: grid;
		/* grid-template-columns: auto var(--size-10) var(--size-10) var(--size-10); */
		grid-template-columns: repeat(5, var(--size-10)); /* var(--size-10) var(--size-10); */
	}
</style>
