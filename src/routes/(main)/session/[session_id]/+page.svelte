<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	// import { sessionStore, type Session, refresh } from '$lib/stores/sessionStore.js';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import {
		ArrowLeft,
		ArrowRight,
		ChevronRightSquare,
		DicesIcon,
		Droplets,
		Megaphone,
		PauseOctagon,
		PlusSquare,
		UploadCloud,
		X
	} from 'lucide-svelte';
	import {
		wsController,
		initialise,
		type wsPlayerMode,
		type playerState,
		playerStateStore,
		combat
	} from '$lib/ws';
	import client from '$lib/api/index';
	import type { Combat } from '../../../../app';
	import { sort_participants_naive } from '$lib';
	import Dialog from '$lib/components/Dialog.svelte';
	import InitiativeRoller from '$lib/components/InitiativeRoller.svelte';
	import CombatInitiativeOrder from '$lib/components/CombatInitiativeOrder.svelte';

	let ws: wsController;
	let debugmode: boolean = true;
	let manualMode: boolean = true;
	let initDialog: Dialog;
	let resetDialog: Dialog;

	let session_id: number = parseInt($page.params.session_id);

	onMount(() => {
		ws = new wsController(`/live/socket/${session_id}`);
		initialise();
	});

	onDestroy(() => {
		if (ws) ws.close();
	});

	const getCombats = async () => {
		return client.GET('/combat/').then((response) => {
			if (!response.data) return [];
			return response.data.items;
		});
	};

	const makeChangeMode = (mode: wsPlayerMode) => {
		let changeMode = (e: MouseEvent) => {
			let ct = e.currentTarget as HTMLDivElement;
			// console.log(ct);
			Array.from(ct.parentElement?.children || []).forEach((e) => e.classList.remove('active'));
			if ($playerStateStore.mode !== 'idle' && mode == $playerStateStore.mode) {
				ws.changeMode({ mode: 'idle' });
				ct.classList.remove('active');
				return;
			}
			ct.classList.add('active');
			ws.changeMode({ mode });
		};
		return changeMode;
	};

	const setMode = (mode: wsPlayerMode) => {
		ws.changeMode({ mode });
		console.log('mode changed to', mode);
	};

	let announce = () => {
		ws.announce({ message: announcement, timeout: 10000 });
	};

	let announcement: string;
	let manuallyDismiss: boolean = false;
</script>

{#if $playerStateStore}
	<div class="sessioncontainer">
		<div class="sessionheader">
			<h1>Session Driver</h1>
			<div><span>{ws && ws.ws.readyState}</span>Connection</div>
		</div>
		<div class="main">
			<div style="display: flex; justify-content: space-between;">
				<h3>Session Controls</h3>
				<div>
					<input type="checkbox" bind:value={manuallyDismiss} />
					<input bind:value={announcement} />
					<button on:click={announce}>Announce<Megaphone /></button>
					Cycle Background?
					<input
						type="checkbox"
						bind:checked={$playerStateStore.background_image_cycle}
						on:change={(e) => {
							ws.setBackgroundImageCycle({ cycle: $playerStateStore.background_image_cycle });
						}}
					/>
				</div>
			</div>
			<div class="controls">
				<div role="button" tabindex="0" class="screen active" on:click={makeChangeMode('backdrop')}>
					Backdrop
				</div>
				<div role="button" tabindex="0" class="screen" on:click={makeChangeMode('loading')}>
					Loading
					<div class="overlay messagebox" />
				</div>
				<div
					role="button"
					tabindex="0"
					class="screen combatcontainer"
					on:click={makeChangeMode('combat')}
				>
					<div class="overlay combatants" />
					<div class="overlay name" />
					<div class="portrait" />
					<div class="overlay upnext" />
				</div>
				<div role="button" tabindex="0" class="screen">Handout</div>
				<div role="button" tabindex="0" class="screen">Map</div>
			</div>
		</div>
		{#if $playerStateStore && !$playerStateStore.combat}
			<div class="main">
				Combat
				<ul>
					{#await getCombats()}
						Loading combats...
					{:then combats}
						{#each combats as combat}
							<li on:click={() => ws.beginCombat({ combat })}>
								{combat.combat_id} - {combat.title}: {combat.participants.length}
							</li>
						{:else}
							No combats found
						{/each}
					{/await}
				</ul>
			</div>
		{:else if $playerStateStore && $playerStateStore.combat}
			{#if $combat}
				<div class="main">
					<div style="display: flex; justify-content: space-between;">
						<h3>Run Combat: {$combat.title}</h3>
						<div>
							<button class:checked={manualMode} on:click={() => (manualMode = !manualMode)}
								>Manual Mode</button
							>
							<button
								disabled={!manualMode}
								on:click={() => {
									if ($combat) ws.updateCombat({ combat: $combat });
								}}><UploadCloud /> Push Update</button
							>
						</div>
						<button on:click={() => ws.suspendCombat()}><ArrowLeft />Change Combat</button>
					</div>
					{#if $combat && !$combat.is_active}
						<button on:click={() => initDialog.open()}><DicesIcon /> Roll for Initiative!</button>
						<button on:click={() => initDialog.open()}><Droplets /> Reset HP!</button>
						<button on:click={() => initDialog.open()}><PlusSquare /> Add Combatant</button>
					{:else}
						<button><PauseOctagon /> Suspend Combat</button>
						<button><ChevronRightSquare /> Advance Combat</button>
					{/if}
					<div class="init">
						<CombatInitiativeOrder playerView={false} controller={ws} manualUpdate={true} />
						<!-- {#each $playerStateStore.combat.participants.toSorted(sort_participants_naive) as participant}
							{JSON.stringify(participant)}
						{/each} -->
					</div>

					Change combat button: (set playerStateStore.combat as undefined) Display Combat X Allow
					any modifications Roll for initiative! begin combat - Advance combat - Deal damage/healing
					- Apply statuses
				</div>
			{/if}

			<!-- <RunCombat /> -->
		{/if}
	</div>
{:else}
	An unexpected error occurred. Could not find session_id.
{/if}
<!-- <div class="status" class:debug={debugmode}>
	{JSON.stringify($playerStateStore)}
</div> -->
<Dialog mode="mega" bind:this={resetDialog}>
	<section class="icon-header" slot="header">
		<Droplets />
		<h3>Roll HP</h3>
	</section>
	<div class="content" slot="content">
		{#if $combat && $combat.participants}
			{#each $combat.participants as participant}
				{participant.name}
			{:else}
				No participants found
			{/each}
		{/if}
	</div>
</Dialog>
{#if $combat && $combat.participants}
	<InitiativeRoller participants={$combat.participants} bind:dialog={initDialog} />
{/if}

<style>
	.checked {
		background-color: var(--brand-background);
	}
	.screen {
		padding: var(--size-3);
		margin: var(--size-3);
		border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8);
		aspect-ratio: 16 / 9;
		/* height: 100px; */
		transition: all 0.2s ease-in-out;
		cursor: pointer;
	}
	.screen:hover {
		transform: scale(1.1);
		transition: all 0.2s ease-in-out;
		border: var(--border-size-2) solid var(--gray-3);
	}
	.screen.active {
		border: var(--border-size-2) solid var(--brand);
	}
	.sessioncontainer {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}
	.sessionheader {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.controls {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
	}
	/* .controls {
		padding: var(--size-3);
		margin: var(--size-3);
		border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8);
	} */
	.main {
		padding: var(--size-3);
		margin: var(--size-3);
		border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8);
	}
	.container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		row-gap: var(--size-3);
		column-gap: var(--size-3);
	}
	.container div * {
		padding-block: var(--size-2);
	}
	.container h1 {
		grid-column: span 3;
	}
	.container h2 {
		font-size: medium;
	}

	.combatcontainer {
		/* position: absolute;
		width: 100%;
		height: 100%; */
		display: grid;
		column-gap: var(--size-2);
		row-gap: var(--size-2);
		/* padding: var(--size-7); */
		grid-template-columns: 1fr 2fr;
		grid-template-rows: 1fr minmax(0, 6fr) 0.5fr;
		/* height: 100%;
		max-height: 100%; */

		/* background-color: red; */
	}
	.overlay {
		background-color: rgba(216, 216, 216, 0.2);
		/* opacity: 0.8; */
		align-self: stretch;
		justify-self: stretch;
		border-radius: var(--radius-2);
		padding: var(--size-3);
	}
	.combatants {
		grid-area: 1 / 1 / 4 / 2;
		/* background-color: antiquewhite; */
	}
	.portrait {
		grid-area: 2 / 2 / 3 / 3;

		/* background-color: transparent; */
		/* opacity: 1; */
	}
	.upnext {
		grid-area: 3/2/4/3;
		text-align: center;
	}
	.name {
		grid-area: 1/2/2/3;
		font-size: larger;
		text-align: center;
		text-shadow: var(--shadow-3);
	}
	.messagebox {
		position: relative;
		margin: auto;
		text-align: center;
		bottom: -40%;
		left: 0;
	}
	.status {
		position: absolute;
		bottom: 0;
		height: 20px;
		width: 100%;
		padding-inline: 5px;
		background-color: rgba(255, 255, 255, 0.4);
	}
	.icon-header {
		display: flex;
		gap: var(--size-3);
		align-items: center;
	}
</style>
