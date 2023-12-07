<script lang="ts">
	import { sort_participants_naive, smartName, is_dead, describeHealth } from '$lib';
	import { flip } from 'svelte/animate';
	import { Dices, Droplets, RefreshCw, RefreshCwOff, Skull } from 'lucide-svelte';

	import { combat } from '$lib/ws';

	// type Participant = components['schemas']['Participant'];
	// type Combat = components['schemas']['Combat'];
	// export let controller: wsController;
</script>

<table style="width: 100%; border-spacing: 0;">
	<thead>
		<th><div class="icon"><Dices /></div></th>
		<th />
		<th>Name</th>
		<th />
		<th><div class="icon"><Droplets color="red" /></div></th>
	</thead>
	<tbody>
		{#if $combat && $combat.participants}
			{#each $combat.participants //combat.participants
				.filter((p) => p.is_visible)
				.toSorted(sort_participants_naive) as participant, i (participant.participant_id)}
				<tr
					animate:flip
					class:activeparticipant={participant.participant_id == $combat.active_participant_id}
				>
					<td>{participant.initiative}</td>

					<td
						><div style="display: flex; flex-direction: row; justify-content: center;">
							<span
								class="circle"
								style={`background: ${participant.colour || 'unset'}; float: left;`}
							/>
						</div>
						<div style="display: flex; flex-direction: row; justify-content: center;">
							<span class="icon" style="position: relative; right: 0;">
								{#if participant.has_reaction}<RefreshCw />{:else}<RefreshCwOff />{/if}
							</span>
						</div>
					</td>

					<td>
						<span class:dead={is_dead(participant)} class:player={participant.is_PC}>
							{smartName(participant.participant_id, $combat.participants /*combat.participants*/)}
						</span>
					</td>
					<td
						><div style="display:flex; justify-content: end; gap: var(--size-3)">
							{#if is_dead(participant)}<div class="icon">
									<Skull />
								</div>
							{/if}
							{#each participant.conditions.split(',') as condition}{condition}{/each}
						</div>
					</td>

					<td
						><div class="damage" style={`color:${describeHealth(participant).style}`}>
							{describeHealth(participant).desc}
						</div>
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
</table>

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
