<script lang="ts">
	import { EyeOff, GripVertical, PlusSquare, Trash2, Undo2, Eye, Tag } from 'lucide-svelte';
	import type { Participant } from '../app';
	import {
		removeParticipant,
		setVisible,
		setReaction,
		setCondition,
		setInitiative,
		setName,
		reorderParticipants,
		updateParticipant
	} from '../stores/combatStore';
	import EditableText from '../components/EditableText.svelte';

	export let participant: Participant;
	// export let dragDisabled: boolean;

	const remainingHpPercent = (participant: Participant): number => {
		return Math.round((100 * (participant.max_hp - participant.damage)) / participant.max_hp);
	};
	// function startDrag(e: any) {
	// 	// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
	// 	// e.preventDefault();
	// 	console.log('sd');
	// 	dragDisabled = false;
	// }
	// function handleKeyDown(e: any) {
	// 	if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	// }
	let setInitiativeAndReorder = (participant_id: number, initiative: string) => {
		return setInitiative(participant_id, parseInt(initiative));
	};
</script>

<!-- <tr class="row"> -->
<td>
	<!-- tabindex={dragDisabled ? 0 : -1}
	aria-label="drag-handle"
	class="handle"
	style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
	on:mousedown={startDrag}
	on:touchstart={startDrag}
	on:keydown={handleKeyDown}> -->
	<GripVertical /></td
>
<td
	><EditableText
		bind:value={participant.initiative}
		callback={(init) => setInitiativeAndReorder(participant.participant_id, init)}
	/></td
>
<td>{participant.colour}</td>
<td class="entityname"
	><span class="circle" style={`background: ${participant.colour};`} />
	{#if !participant.is_visible}<EyeOff />&nbsp;{/if}
	<EditableText
		bind:value={participant.name}
		callback={(name) => setName(participant.participant_id, name)}
	/>
</td>
<td>
	{participant.max_hp - participant.damage}/{participant.max_hp}
	<span class="fullhp">
		<span class="remaininghp" style="width: {remainingHpPercent(participant)}%" />
	</span>
</td>
<td>{participant.ac}</td>
<td class="icons">
	<div role="button" on:click={() => removeParticipant(participant.participant_id)}>
		<Trash2 />
	</div>
	{#if participant.is_visible}
		<div role="button" on:click={() => setVisible(participant.participant_id, false)}>
			<Eye />
		</div>
	{:else}
		<div role="button" on:click={() => setVisible(participant.participant_id, true)}>
			<EyeOff />
		</div>
	{/if}
	<div><Undo2 /></div>
	<div><Tag /></div>
</td>

<!-- </div> -->
<!-- </tr> -->

<style>
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

	.entityname {
		text-align: left;
		display: flex;
		flex-direction: row;
	}
	.icons {
		height: 100%;
		display: flex;
		flex-flow: row;
		width: fit-content;
		white-space: nowrap;
		width: fit-content;
		align-items: center;
		/* opacity: 0; */
	}
	:hover .icons {
		transition: opacity 0.2s var(--ease-in-out-3);
		/*animation: var(--animation-fade-in) forwards, var(--animation-slide-in-top);*/
		opacity: 1;
	}
	.row {
		gap: var(--size-1);
		padding-block: var(--size-1);
		cursor: pointer;
	}
	.row:hover {
		background-color: var(--surface-4);
	}
	.row.active {
		border: solid 1px #c00;
	}
	.circle {
		/* position: absolute; */
		right: 0;
		border-radius: 50%;
		margin: 10px;
		height: var(--size-3);
		width: var(--size-3);
		transform: scale(1);
		background: rgba(255, 177, 66, 1);
		border: solid 1px var(--text-2);
	}
	.displaycontents {
		display: table-row;
	}
</style>
