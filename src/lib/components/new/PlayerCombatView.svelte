<script lang="ts">
	import {
		sort_participants_naive,
		smartName,
		is_dead,
		describeHealth,
		remainingHpPercent,
		capitalise
	} from '$lib';
	import { flip } from 'svelte/animate';
	import { Dices, Droplets, RefreshCw, RefreshCwOff, Skull } from 'lucide-svelte';

	import * as Table from '$lib/components/ui/table';
	import { combat } from '$lib/ws';
	import { cn } from '$lib/utils';

	// type Participant = components['schemas']['Participant'];
	// type Combat = components['schemas']['Combat'];
	// export let controller: wsController;
</script>

<Table.Root class="bg-gray-900/90 rounded-lg" style="width: 100%; border-spacing: 0;">
	<Table.Header class="border-b-0">
		<Table.Row class="border-b-0">
			<Table.Head class="text-center flex justify-center items-center"><Dices /></Table.Head>
			<Table.Head class="text-center">Reaction</Table.Head>
			<Table.Head class="text-center">Name</Table.Head>
			<Table.Head class="text-center">Conditions</Table.Head>
			<Table.Head class="text-center flex justify-center items-center"
				><Droplets color="red" /></Table.Head
			>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#if $combat && $combat.participants}
			{#each $combat.participants //combat.participants
				.filter((p) => p.is_visible)
				.toSorted(sort_participants_naive) as participant, i (participant.participant_id)}
				<tr
					animate:flip
					class={cn('transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', {
						activeparticipant: participant.participant_id == $combat.active_participant_id
					})}
				>
					<Table.Cell class="p-1 text-center"
						><span class="text-shadow">{participant.initiative}</span></Table.Cell
					>

					<Table.Cell class="p-2">
						<div style="display: flex; flex-direction: row; justify-content: center;">
							<span class="icon" style="position: relative; right: 0;">
								{#if participant.has_reaction}<RefreshCw />{:else}<RefreshCwOff />{/if}
							</span>
						</div>
					</Table.Cell>

					<Table.Cell class="p-2">
						<!-- <div style="display: flex; flex-direction: row; justify-content: center;">
							<span
								class="circle"
								style={`background: ${participant.colour || 'unset'}; float: left;`}
							/>
						</div> -->
						<span
							class={cn('text-shadow', {
								dead: is_dead(participant),
								player: participant.is_PC
							})}
						>
							{smartName(participant.participant_id, $combat.participants /*combat.participants*/)}
						</span>
					</Table.Cell>
					<Table.Cell class="p-2"
						><div style="display:flex; justify-content: end; gap: var(--size-3)">
							{#if is_dead(participant)}<div class="icon">
									<Skull />
								</div>
							{/if}
							<span class="text-shadow"
								>{participant.conditions.split(',').map(capitalise).join(', ')}</span
							>
						</div>
					</Table.Cell>

					<Table.Cell class="p-2">
						<div
							class="damage hitpoints text-center"
							style={`${describeHealth(participant).style}`}
						>
							{describeHealth(participant).desc}
							<span class="fullhp">
								<span class="remaininghp" style="width: {remainingHpPercent(participant)}%" />
							</span>
						</div>
					</Table.Cell>
				</tr>
			{/each}
		{/if}
	</Table.Body>
</Table.Root>

<style>
	.text-shadow {
		text-shadow: 0.05em 0 black, 0 0.05em black, -0.05em 0 black, 0 -0.05em black,
			-0.05em -0.05em black, -0.05em 0.05em black, 0.05em -0.05em black, 0.05em 0.05em black;
	}
	.activeparticipant {
		background: linear-gradient(70deg, #334, #777);
		background-size: 400% 400%;
		animation: gra 5s ease infinite;
		background-color: transparent;
		/* transform: scale(1.1); */
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
