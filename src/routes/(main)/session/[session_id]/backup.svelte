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
		LocateOff,
		MapIcon,
		Megaphone,
		MegaphoneOff,
		PauseOctagon,
		PlusSquare,
		RefreshCw,
		Scroll,
		ScrollText,
		SwissFranc,
		Swords,
		UploadCloud,
		X
	} from 'lucide-svelte';
	import { initialise, playerStateStore, combat, wsController } from '$lib/ws';
	import client from '$lib/api/index';
	import type { Combat, Participant } from '../../../../app';
	import { get_next_alive_participant_id, get_top_initiative_id, makeCancelable } from '$lib';
	// import Dialog from '$lib/components/Dialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	import CombatInitiativeOrder from '$lib/components/CombatInitiativeOrder.svelte';
	import CombatSetup from '$lib/components/new/CombatSetup.svelte';
	import CombatTable from '$lib/components/new/CombatTable.svelte';
	import HitPointTable from '$lib/components/new/HitPointTable.svelte';
	import * as Sheet from '$lib/components/ui/sheet';

	import {
		dispatchGeneralCounterEvent,
		dispatchParticipantCounterEvent
	} from '$lib/stores/counterStore';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Toggle } from '$lib/components/ui/toggle';

	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { cn } from '$lib/utils';
	import { tweened } from 'svelte/motion';
	import ImageSelection from '$lib/components/ImageSelection.svelte';
	import Map from '$lib/components/new/Map.svelte';
	import Handout from '$lib/components/new/Handout.svelte';
	import DisplayImage from '$lib/components/new/DisplayImage.svelte';
	import MapSelect from '$lib/components/new/MapSelect.svelte';

	let announceTimer = tweened(100);

	let ws: wsController;
	let debugmode: boolean = true;
	let manualMode: boolean = false;
	let initDialog: CombatSetup;
	// let step: 'initiative' | 'hp' = 'hp';
	let fresh: boolean = true;

	let session_id: string = $page.params.session_id;

	let clientURL: string;
	// let urlBox: Dialog;
	let urlBoxOpen: boolean = false;
	let urlBoxInputField: HTMLInputElement;

	let selectionOpen: boolean = false;
	let imageSelectionMode: 'backdrop' | 'handout' = 'backdrop';

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

	let announce = () => {
		if (autoClearAnnoucement) {
			ws.announce({
				message: announcement,
				timeout: $playerStateStore.announce_timeout,
				display: true
			});
		} else {
			ws.announce({
				message: announcement,
				timeout: $playerStateStore.announce_timeout,
				display: true
			});
		}
		if (autoClearAnnoucement) {
			setTimeout(clearAnnouncement, $playerStateStore.announce_timeout);
		}
	};
	let handleAnnounce = () => {
		if (!isAnnouncing) {
			isAnnouncing = true;
			announce();
			if (autoClearAnnoucement) {
				awaitingCancel = true;
				announceTimer.set(100, { duration: 0 });
				announcePromise = makeCancelable<void>(
					announceTimer.set(0, { duration: $playerStateStore.announce_timeout })
				);
				announcePromise.promise.then(() => {
					clearAnnouncement();
					isAnnouncing = false;
					awaitingCancel = false;
				});
			}
		} else {
			if (announcePromise) announcePromise.cancel();
			clearAnnouncement();
			isAnnouncing = false;
			awaitingCancel = false;
		}
	};
	let clearAnnouncement = () => {
		ws.clearAnnouncement();
	};
	let announcePromise: ReturnType<typeof makeCancelable<void>>;
	let announcement: string;
	let autoClearAnnoucement: boolean = false;
	let isAnnouncing = false;
	let awaitingCancel = false;

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

	const screens = ['Combat', 'Map', 'Background', 'Handout'];
	let currentScreen = 'Combat';

	const showHide = (display: boolean) => {
		return display ? 'Hide' : 'Show';
	};
	// const beforeUnload = (event: BeforeUnloadEvent) => {};
</script>

<!-- <svelte:window on:beforeunload={beforeUnload} /> -->

{#if $playerStateStore}
	<div class="sessioncontainer">
		<div class="sessionheader">
			<h1>Session Driver</h1>
			<div>
				<Button
					variant="outline"
					on:click={() => {
						urlBoxOpen = true;
						// urlBox.open();
						tick().then(() => {
							urlBoxInputField.select();
						});
					}}><Clipboard class="w-4 h-4 mr-2" />Copy Client URL</Button
				>
			</div>
		</div>
		<div class="border-solid border-[1px] rounded-md border-gray-600 p-3 my-3">
			<!-- <div style="display: flex; justify-content: space-between;">
				<h3>Session Controls</h3>
			</div> -->
			<div class="grid gap-2" style="grid-template-columns: auto 1fr;">
				<div class="flex flex-col justify-center">Announce:</div>
				<div class="flex gap-3 justify-start">
					<Input bind:value={announcement} placeholder="Announce Message" class="w-[200px]" />

					<Button on:click={handleAnnounce} variant="outline" class="w-32">
						{#if isAnnouncing}
							<div class="flex flex-col w-full">
								<div class="flex flex-row justify-center">
									<MegaphoneOff class="w-4 h-4 mr-2" />
									Clear
								</div>
								{#if awaitingCancel}
									<div class="w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700">
										<div class="bg-blue-600 h-0.5 rounded-full" style="width: {$announceTimer}%" />
									</div>
								{/if}
							</div>
						{:else}
							<Megaphone class="w-4 h-4 mr-2" />Announce
						{/if}
					</Button>
					<!-- <Button on:click={announce} variant="outline" class="w-40">
						<Megaphone class="w-4 h-4 mr-2" />Announce
					</Button>
					<Button on:click={clearAnnouncement} variant="outline" disabled={autoClearAnnoucement}>
						<MegaphoneOff class="w-4 h-4 mr-2" />
						Clear Announcement
					</Button> -->
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
						{showHide($playerStateStore.background_image_display)} Background
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
					<Button
						variant="secondary"
						on:click={() => {
							imageSelectionMode = 'backdrop';
							selectionOpen = true;
						}}
					>
						<FileSearch class="w-4 h-4 mr-2" />Select Image...
					</Button>
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
						{showHide($playerStateStore.message_display)} Message
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
						{showHide($playerStateStore.spinner_display)} Loading Spinner
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
						{showHide($playerStateStore.combat_display)} Combat
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
						{showHide($playerStateStore.handout_display)} Handout
					</Toggle>
					<Input
						placeholder="Handout ID"
						bind:value={$playerStateStore.handout_image_id}
						class="w-[200px]"
					/>
					<Button
						variant="secondary"
						on:click={() => {
							imageSelectionMode = 'handout';
							selectionOpen = true;
						}}><FileSearch class="w-4 h-4 mr-2" />Select Handout...</Button
					>
				</div>
				<div class="flex flex-col justify-center">Map:</div>
				<div class="flex gap-3 justify-start">
					<Toggle
						variant="outline"
						bind:pressed={$playerStateStore.map_display}
						onPressedChange={(e) => {
							ws.setMap({
								display: !$playerStateStore.map_display,
								map_id: $playerStateStore.map_image_id,
								map_data: $playerStateStore.map_data
							});
						}}
						><MapIcon class="w-4 h-4 mr-2" />
						{showHide($playerStateStore.map_display)} Map
					</Toggle>
					<Input
						placeholder="Map ID"
						bind:value={$playerStateStore.map_image_id}
						class="w-[200px]"
					/>
					<Button variant="secondary"><MapIcon class="w-4 h-4 mr-2" />Select Map...</Button>
				</div>
			</div>
		</div>

		<div class="relative">
			<div class="lg:max-w-none">
				<div class="mb-4 flex items-center overflow-y-auto pb-3 md:pb-0 gap-3">
					{#each screens as screen, index (index)}
						{@const isActive = currentScreen == screen}
						<Button
							class={cn(
								'relative flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors bg-[unset] hover:text-primary',
								isActive ? 'font-medium text-primary' : 'text-muted-foreground'
							)}
							on:click={() => {
								currentScreen = screen;
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
								{screen}
							</div>
						</Button>
					{/each}
				</div>
			</div>
		</div>
		{#if currentScreen == 'Handout'}
			<Handout />
		{:else if currentScreen == 'Map'}
			<Button
				variant="destructive"
				disabled={$playerStateStore.map_data == undefined}
				on:click={() => {
					ws.setMap({
						map_data: {
							x: 0.5,
							y: 0.5,
							scale: 1,
							transition: $playerStateStore.map_data?.transition || 1000
						},
						display: $playerStateStore.map_display,
						map_id: $playerStateStore.map_image_id
					});
				}}><LocateOff class="h-4 w-4 mr-2" />Reset Map Focus</Button
			>
			<MapSelect
				on:click={(e) => {
					console.log(e.detail);
					ws.setMap({
						map_data: { ...e.detail, transition: 1000 },
						display: $playerStateStore.map_display,
						map_id: $playerStateStore.map_image_id
					});
				}}
			/>
		{:else if currentScreen == 'Background'}
			<DisplayImage image_id={$playerStateStore.background_image_id} />
		{:else if $playerStateStore && !$playerStateStore.combat}
			<CombatTable
				{ws}
				on:select_combat={(e) => {
					ws.updateCombat({ combat: e.detail.combat });
				}}
			/>
		{:else if $playerStateStore && $playerStateStore.combat}
			{#if $combat}
				<div class="main">
					<div class="flex justify-between">
						<h3>Run Combat: {$combat.title}</h3>
						<div>
							<Toggle
								bind:pressed={manualMode}
								on:click={() => {
									if (!fresh && $combat) ws.updateCombat({ combat: $combat });
									manualMode = !manualMode;
								}}>Manual Mode</Toggle
							>
							<Button
								disabled={!manualMode}
								on:click={() => {
									if (!$combat) return;
									ws.updateCombat({ combat: $combat });
									fresh = true;
								}}><UploadCloud class="h-4 w-4 mr-2" /> Push Update</Button
							>
						</div>
						<Button on:click={() => ws.suspendCombat()}
							><ArrowLeft class="h-4 w-4 mr-2" />Change Combat</Button
						>
					</div>
					{#if !$combat.is_active}
						<!-- <button on:click={rollHP}><Cross /> Roll HP</button> -->
						<Button on:click={commenceCombat}>
							<Swords class="h-4 w-4 mr-2" /> Commence Combat: Roll for Initiative
						</Button>
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
							<Button
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
								}}
							>
								<ChevronRightSquare class="h-4 w-4 mr-2" /> Advance Combat
							</Button>
							<div>
								Round {$combat.round}
							</div>
							<div>
								<Button on:click={healAll}><Cross class="h-4 w-4 mr-2" /></Button>
								<Button on:click={commenceCombat}><Dices class="h-4 w-4 mr-2" /></Button>
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
		{/if}
	</div>
{:else}
	An unexpected error occurred. Could not find session_id.
{/if}
<!-- <div class="status" class:debug={debugmode}>
	{JSON.stringify($playerStateStore)}
</div> -->

<Sheet.Root bind:open={selectionOpen}>
	<Sheet.Content side="right" class="overflow-y-scroll sm:max-w-[100%]">
		<ImageSelection
			selectSingleImage={imageSelectionMode == 'handout'}
			on:selection={(e) => {
				if (imageSelectionMode == 'backdrop') {
					ws.setBackgroundImage({
						cycle: $playerStateStore.background_image_cycle,
						data: e.detail.imageData,
						display: $playerStateStore.background_image_display,
						timeout: $playerStateStore.background_image_timeout,
						image_id: $playerStateStore.background_image_id
					});
				} else {
					if (e.detail.collection) return;
					ws.setHandout({
						display: $playerStateStore.handout_display,
						handout_id: e.detail.imageData
					});
				}
				selectionOpen = false;
			}}
		/>
	</Sheet.Content>
</Sheet.Root>

{#if $combat && $combat.participants}
	<CombatSetup
		bind:this={initDialog}
		on:changeParticipant={onChangeParticipants}
		on:changeParticipantNames={onChangeParticipantsNames}
		on:submitForm={onSubmitForm}
	/>
{/if}

<Dialog.Root bind:open={urlBoxOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Client URL</Dialog.Title>
			<Dialog.Description>Click to copy the URL and then send it to the client</Dialog.Description>
		</Dialog.Header>
		<div style="display:flex; align-items: center; justify-content: flex-start;">
			<input
				class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				bind:value={clientURL}
				readonly={true}
				bind:this={urlBoxInputField}
			/>
			<Button
				class="boxbutton"
				on:click={() => {
					urlBoxInputField.select();
					document.execCommand('copy');

					urlBoxOpen = false;
					// urlBox.close();
				}}><ClipboardCopy /></Button
			>
		</div>
		<!-- <Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer> -->
	</Dialog.Content>
</Dialog.Root>

<!-- <Dialog mode={'mini'} bind:this={urlBox}>

</Dialog> -->

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
