<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	// import { sessionStore, type Session, refresh } from '$lib/stores/sessionStore.js';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onDestroy, onMount, tick } from 'svelte';
	import {
		ArrowLeft,
		ArrowRight,
		ChevronRightSquare,
		Clipboard,
		ClipboardCopy,
		Cross,
		Dices,
		DicesIcon,
		Droplets,
		FileSearch,
		Hourglass,
		Image,
		Megaphone,
		MegaphoneOff,
		PauseOctagon,
		Play,
		PlusSquare,
		RefreshCw,
		Scroll,
		ScrollText,
		SwissFranc,
		Swords,
		UploadCloud,
		X
	} from 'lucide-svelte';
	import {
		initialise,
		type wsPlayerMode,
		type playerState,
		playerStateStore,
		combat,
		wsController
	} from '$lib/ws';
	import client from '$lib/api/index';
	import type { Combat, Participant } from '../../../../app';
	import {
		get_next_alive_participant_id,
		get_next_participant_id,
		get_top_initiative_id,
		sort_participants_by_id,
		sort_participants_naive
	} from '$lib';
	import Dialog from '$lib/components/Dialog.svelte';
	import CombatInitiativeOrder from '$lib/components/CombatInitiativeOrder.svelte';
	import CombatSetup from '$lib/components/new/CombatSetup.svelte';
	import HitPointRow from '$lib/components/new/HitPointRow.svelte';
	import HitPointTable from '$lib/components/new/HitPointTable.svelte';

	import Pagination from '$lib/components/Pagination.svelte';
	import PaginationStub from '$lib/components/PaginationStub.svelte';
	import {
		dispatchGeneralCounterEvent,
		dispatchParticipantCounterEvent
	} from '$lib/stores/counterStore';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Toggle } from '$lib/components/ui/toggle';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { cn } from '$lib/utils';

	let ws: wsController;
	let debugmode: boolean = true;
	let manualMode: boolean = false;
	let initDialog: CombatSetup;
	// let step: 'initiative' | 'hp' = 'hp';
	let fresh: boolean = true;

	let session_id: string = $page.params.session_id;

	let currentPage: number = 1;
	let numPages: number = 1;

	let clientURL: string;
	let urlBox: Dialog;
	let urlBoxInputField: HTMLInputElement;

	onMount(() => {
		ws = new wsController(`/live/socket/${session_id}`);
		// console.log($page.url.origin);
		clientURL = `${$page.url.origin}/room/${session_id}`;
		initialise();
	});

	onDestroy(() => {
		if (ws) ws.close();
	});

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});

	const getCombats = async (page: number = 1) => {
		return client.GET('/combat/', { params: { query: { page, size: 10 } } }).then((response) => {
			if (!response.data) return [];
			currentPage = response.data.page || 1;
			numPages = response.data.pages || 1;
			return response.data.items;
		});
	};

	let announce = () => {
		if (autoClearAnnoucement) {
			ws.announce({ message: announcement, timeout: 10000, display: true });
		} else {
			ws.announce({ message: announcement, timeout: -1, display: true });
		}
	};
	let clearAnnouncement = () => {
		ws.clearAnnouncement();
	};

	let announcement: string;
	let autoClearAnnoucement: boolean = false;

	// const setHitPoints = (e: CustomEvent) => {
	// 	// if (!$combat) return;
	// 	// ws.updateParticipants($combat.combat_id, e.detail.hitpoints);
	// 	// console.log(e.detail.hitpoints);
	// };
	// const setInitiatives = (e: CustomEvent) => {
	// 	// if (!$combat) return;
	// 	// ws.updateParticipants($combat.combat_id, e.detail.initiatives);
	// 	// console.log(e.detail.initiatives);
	// };
	const onChangeParticipants = (e: CustomEvent) => {
		if (!$combat) return;
		console.log(e.detail.participants);
		ws.updateParticipants($combat.combat_id, e.detail.participants);
	};

	const onChangeParticipantsNames = (
		e: CustomEvent<{ participants: { participant_id: number; name: string }[] }>
	) => {
		console.log('TEST');
		e.detail.participants.forEach((p) => {
			ws.updateParticipant(p.participant_id, { name: p.name });
		});
		if ($combat) ws.updateCombat({ combat: $combat });
	};

	const onSubmitForm = () => {
		if (!$combat) return;
		ws.clearAnnouncement();
		ws.advanceCombat({
			next_participant_id: get_top_initiative_id($combat.participants),
			have_looped: false
		});
		ws.beginCombat({ combat: $combat });
	};

	const handleCombatUpdate = (e: CustomEvent<{ combat: Combat }>) => {
		if (manualMode) {
			fresh = false;
		} else {
			if (!$combat) {
				console.log('Oh no');
				return;
			}
			ws.updateCombat({ combat: e.detail.combat });
		}
	};
	// const rollHP = () => {
	// 	step = 'hp';
	// 	if (!$combat) return;
	// 	// ws.announce({ message: 'Roll for Initiative', timeout: -1, display: true });
	// 	initDialog.open($combat.participants);
	// };
	const commenceCombat = () => {
		// step = 'initiative';
		if (!$combat) return;
		ws.announce({ message: 'Roll for Initiative', timeout: -1, display: true });
		initDialog.open($combat.participants);
	};
	const onUpdateHitpoints = (
		e: CustomEvent<{ participant_id: number; max_hp: number; damage: number }>
	) => {
		ws.updateParticipant(e.detail.participant_id, {
			max_hp: e.detail.max_hp,
			damage: e.detail.damage
		});
	};

	const healAll = () => {
		if (!$combat) return;
		$combat.participants.forEach((p) => ws.setDamage(p.participant_id, 0));
		// ws.updateCombat({ combat: $combat });
	};

	const actions = ['Announce', 'Backdrop', 'Message', 'Combat', 'Handout'];
	let currentAction = 'Announce';
</script>

{#if $playerStateStore}
	<div class="sessioncontainer">
		<div class="sessionheader">
			<h1>Session Driver</h1>
			<div>
				<Button
					variant="outline"
					on:click={() => {
						urlBox.open();
						tick().then(() => {
							urlBoxInputField.select();
						});
					}}>Copy Client URL<Clipboard class="w-4 h-4 ml-2" /></Button
				>
			</div>
		</div>
		<div class="border-solid border-[1px] rounded-md border-gray-600 p-3 my-3">
			<!-- Scrollbox component, not really needed but also cool so don't delete -->
			<!-- <div class="relative">
				<div class="lg:max-w-none">
					<div class="mb-4 flex items-center overflow-y-auto pb-3 md:pb-0 gap-3">
						{#each actions as action, index (index)}
							{@const isActive = currentAction == action}
							<Button
								class={cn(
									'relative flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors bg-[unset] hover:text-primary',
									isActive ? 'font-medium text-primary' : 'text-muted-foreground'
								)}
								on:click={() => {
									currentAction = action;
								}}
							>
								{#if isActive}
									<div
										class="absolute inset-0 rounded-full bg-muted"
										in:send={{ key: 'activetab' }}
										out:receive={{ key: 'activetab' }}
									/>
								{/if}
								<div class="relative">
									{action}
								</div>
							</Button>
						{/each}
					</div>
				</div>
			</div> -->
			<!-- End Scrollbox Component -->

			<!-- <div style="display: flex; justify-content: space-between;">
				<h3>Session Controls</h3>
			</div> -->
			<div class="grid gap-2" style="grid-template-columns: auto 1fr;">
				<div class="flex flex-col justify-center">Announce:</div>
				<div class="flex gap-3 justify-start">
					<Input bind:value={announcement} placeholder="Announce Message" class="w-[200px]" />
					<Button on:click={announce} variant="outline"
						><Megaphone class="w-4 h-4 mr-2" />Announce</Button
					>
					<Button on:click={clearAnnouncement} variant="outline" disabled={autoClearAnnoucement}>
						<MegaphoneOff class="w-4 h-4 mr-2" />
						Clear Announcement
					</Button>
					<Toggle bind:pressed={autoClearAnnoucement} variant="outline">
						<label for="autoclearannounce">Automatically Clear</label>
					</Toggle>
					<Input
						bind:value={$playerStateStore.announce_timeout}
						placeholder="Announce Timeout"
						class="w-[200px]"
					/>
				</div>
				<div class="flex flex-col justify-center">Backdrop:</div>
				<div class="flex gap-3 justify-start">
					<Toggle
						variant="outline"
						bind:pressed={$playerStateStore.background_image_display}
						onPressedChange={(e) => {
							console.log('change');
							ws.setBackgroundImage({
								cycle: $playerStateStore.background_image_cycle,
								data: $playerStateStore.background_image_data,
								display: !$playerStateStore.background_image_display,
								timeout: $playerStateStore.background_image_timeout,
								image_id: $playerStateStore.background_image_id
							});
						}}
					>
						<Image class="w-4 h-4 mr-2" />
						Show Background
					</Toggle>
					<Toggle
						variant="outline"
						bind:pressed={$playerStateStore.background_image_cycle}
						on:click={(e) => {
							ws.setBackgroundImage({
								cycle: !$playerStateStore.background_image_cycle,
								data: $playerStateStore.background_image_data,
								display: $playerStateStore.background_image_display,
								timeout: $playerStateStore.background_image_timeout,
								image_id: $playerStateStore.background_image_id
							});
						}}
					>
						<RefreshCw class="w-4 h-4 mr-2" />
						Cycle Background
					</Toggle>

					<Input
						placeholder="Timeout"
						bind:value={$playerStateStore.background_image_timeout}
						class="w-[200px]"
					/>
					<Button variant="secondary"><FileSearch class="w-4 h-4 mr-1" />Select Image...</Button>
					<Input
						placeholder="Image ID"
						bind:value={$playerStateStore.background_image_id}
						class="w-[200px]"
						disabled={true}
						on:change={() => {
							if ($playerStateStore.background_image_id) {
								ws.setBackgroundImage({
									cycle: false,
									data: $playerStateStore.background_image_data,
									display: $playerStateStore.background_image_display,
									timeout: $playerStateStore.background_image_timeout,
									image_id: $playerStateStore.background_image_id
								});
							} else {
								ws.setBackgroundImage({
									cycle: $playerStateStore.background_image_cycle,
									data: $playerStateStore.background_image_data,
									display: $playerStateStore.background_image_display,
									timeout: $playerStateStore.background_image_timeout,
									image_id: $playerStateStore.background_image_id
								});
							}
						}}
					/>
				</div>
				<div class="flex flex-col justify-center">Message:</div>
				<div class="flex gap-3 justify-start">
					<Toggle
						variant="outline"
						bind:pressed={$playerStateStore.message_display}
						onPressedChange={(e) => {
							ws.setLoadingMessage({
								cycle: $playerStateStore.message_cycle,
								display: !$playerStateStore.message_display,
								timeout: $playerStateStore.message_timeout,
								message_id: $playerStateStore.message_id
							});
						}}
					>
						<ScrollText class="w-4 h-4 mr-2" />
						Show Message
					</Toggle>
					<Toggle
						variant="outline"
						bind:pressed={$playerStateStore.message_cycle}
						onPressedChange={(e) => {
							ws.setLoadingMessage({
								cycle: !$playerStateStore.message_cycle,
								display: $playerStateStore.message_display,
								timeout: $playerStateStore.message_timeout,
								message_id: $playerStateStore.message_id
							});
						}}
					>
						<RefreshCw class="w-4 h-4 mr-2" />
						Cycle Message
					</Toggle>
					<Toggle
						variant="outline"
						bind:pressed={$playerStateStore.spinner_display}
						onPressedChange={(e) => {
							ws.showSpinner({
								display: !$playerStateStore.spinner_display
							});
						}}
					>
						<Hourglass
							class={cn('w-4 h-4 mr-2', $playerStateStore.spinner_display && 'animate-spin')}
						/>
						Show Loading Spinner
					</Toggle>
					<Input
						placeholder="Timeout"
						bind:value={$playerStateStore.message_timeout}
						class="w-[200px]"
					/>
				</div>
				<div class="flex flex-col justify-center">Combat:</div>
				<div class="flex gap-3 justify-start">
					<Toggle
						variant="outline"
						disabled={!$playerStateStore.combat}
						bind:pressed={$playerStateStore.combat_display}
						onPressedChange={(e) => {
							ws.showCombat({
								display: !$playerStateStore.combat_display
							});
						}}
					>
						<Swords class="w-4 h-4 mr-2" />
						Show Combat
					</Toggle>
				</div>
				<div class="flex flex-col justify-center">Handout:</div>
				<div class="flex gap-3 justify-start">
					<Toggle
						variant="outline"
						bind:pressed={$playerStateStore.handout_display}
						onPressedChange={(e) => {
							ws.setHandout({
								display: !$playerStateStore.handout_display,
								handout_id: $playerStateStore.handout_image_id
							});
						}}
						><Scroll class="w-4 h-4 mr-2" />
						Show Handout
					</Toggle>
					<Input
						placeholder="Handout ID"
						bind:value={$playerStateStore.handout_image_id}
						class="w-[200px]"
					/>
					<Button variant="secondary"><FileSearch class="w-4 h-4 mr-1" />Select Handout...</Button>
				</div>
			</div>
		</div>
		{#if $playerStateStore && !$playerStateStore.combat}
			<div class="main">
				Combat
				{#await getCombats()}
					Loading combats...
				{:then combats}
					<Pagination {currentPage} {numPages} on:change={() => {}} />
					<table>
						<thead><th>Id</th><th>Title</th><th>No. participants</th><th>Load</th></thead>
						<tbody>
							{#each combats as combat}
								<tr>
									<td>{combat.combat_id}</td>
									<td>{combat.title}</td>
									<td>{combat.participants.length}</td>
									<td><button on:click={() => ws.updateCombat({ combat })}><Play /></button></td>
								</tr>
							{:else}
								<tr>
									<td colspan="4"> No combats found </td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/await}
			</div>
		{:else if $playerStateStore && $playerStateStore.combat}
			{#if $combat}
				<div class="main">
					<div class="flex justify-between">
						<h3>Run Combat: {$combat.title}</h3>
						<div>
							<button
								class:checked={manualMode}
								on:click={() => {
									if (!fresh && $combat) ws.updateCombat({ combat: $combat });
									manualMode = !manualMode;
								}}>Manual Mode</button
							>
							<button
								disabled={!manualMode}
								class:checked={!fresh && manualMode}
								on:click={() => {
									if (!$combat) return;
									ws.updateCombat({ combat: $combat });
									fresh = true;
								}}><UploadCloud /> Push Update</button
							>
						</div>
						<button on:click={() => ws.suspendCombat()}><ArrowLeft />Change Combat</button>
					</div>
					{#if !$combat.is_active}
						<!-- <button on:click={rollHP}><Cross /> Roll HP</button> -->
						<button on:click={commenceCombat}
							><Swords /> Commence Combat: Roll for Initiative</button
						>
						<!-- <button
							on:click={() => {
								step = 'hp';
								if (!$combat) return;
								initDialog.open($combat.participants);
							}}><Droplets /> Reset HP!</button
						> -->
					{:else}
						<!-- <button disabled><PauseOctagon /> Suspend Combat</button> -->
						<div class="flex justify-between items-center">
							<button
								on:click={() => {
									if ($combat && $combat.active_participant_id) {
										let p = get_next_alive_participant_id(
											$combat?.active_participant_id,
											$combat?.participants
										);
										if (p.have_looped) {
											dispatchGeneralCounterEvent('round');
										}
										dispatchParticipantCounterEvent(p.next_participant_id, 'turn');
										ws.advanceCombat({
											...p
										});
									}
								}}><ChevronRightSquare /> Advance Combat</button
							>
							<div>
								Round {$combat.round}
							</div>
							<div>
								<button on:click={healAll}><Cross /></button>
								<button on:click={commenceCombat}><Dices /></button>
							</div>
						</div>
					{/if}
					<div class="init">
						{#if $combat.is_active}
							<CombatInitiativeOrder controller={ws} on:combat_updated={handleCombatUpdate} />
						{:else}
							<HitPointTable controller={ws} />
						{/if}
					</div>
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

{#if $combat && $combat.participants}
	<CombatSetup
		bind:this={initDialog}
		on:changeParticipant={onChangeParticipants}
		on:changeParticipantNames={onChangeParticipantsNames}
		on:submitForm={onSubmitForm}
	/>
{/if}
<Dialog mode={'mini'} bind:this={urlBox}>
	<div slot="content" style="display:flex; align-items: center; justify-content: flex-start;">
		<input class="boxbutton" bind:value={clientURL} readonly={true} bind:this={urlBoxInputField} />
		<button
			class="boxbutton"
			on:click|preventDefault={() => {
				urlBoxInputField.select();
				document.execCommand('copy');
				urlBox.close();
			}}><ClipboardCopy /></button
		>
	</div>
</Dialog>

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
		/* border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8); */
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
	.initiativebox {
		min-width: 800px;
		/* max-height: 500px; */
		display: grid;
		grid-template-columns: 1fr;
		justify-content: start;
		align-items: start;
		column-gap: var(--size-2);
	}
</style>
