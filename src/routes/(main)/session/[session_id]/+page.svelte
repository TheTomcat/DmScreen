<script lang="ts">
	import OverlayManager from './OverlayManager.svelte';

	import PresetManager from './PresetManager.svelte';

	import SessionHeader from './SessionHeader.svelte';

	import { toast } from '@zerodevx/svelte-toast';
	// import { sessionStore, type Session, refresh } from '$lib/stores/sessionStore.js';

	import { page } from '$app/stores';
	import { onDestroy, onMount, tick } from 'svelte';
	import {
		ArrowLeft,
		ChevronRightSquare,
		Clipboard,
		ClipboardCopy,
		Cross,
		Dices,
		FileSearch,
		RefreshCw,
		Swords,
		UploadCloud
	} from 'lucide-svelte';
	import {
		initialise,
		playerStateStore,
		combat,
		wsController,
		getPresets,
		type Preset
	} from '$lib/ws';

	import type { Combat } from '../../../../app';
	import { get_next_alive_participant_id, get_top_initiative_id, makeCancelable } from '$lib';
	// import Dialog from '$lib/components/Dialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	import CombatInitiativeOrder from '$lib/components/CombatInitiativeOrder.svelte';
	import CombatSetup from '$lib/components/new/CombatSetup.svelte';
	import HitPointTable from '$lib/components/new/HitPointTable.svelte';
	import * as Sheet from '$lib/components/ui/sheet';

	import {
		dispatchGeneralCounterEvent,
		dispatchParticipantCounterEvent
	} from '$lib/stores/counterStore';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Toggle } from '$lib/components/ui/toggle';
	import ImageSelection from '$lib/components/ImageSelection.svelte';
	import DisplayImage from '$lib/components/new/DisplayImage.svelte';
	import MapSelect from '$lib/components/new/MapSelect.svelte';
	import ScrollBox from '$lib/components/ScrollBox.svelte';
	import DataTable from '$lib/components/datatables/combats/data-table.svelte';

	let ws: wsController;

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
	let imageSelectionMode: 'backdrop' | 'handout' | 'map' = 'backdrop';

	let presets: Preset[];

	onMount(() => {
		ws = new wsController(`/live/socket/${session_id}`);
		// console.log($page.url.origin);
		clientURL = `${$page.url.origin}/room/${session_id}`;
		initialise();
		presets = getPresets();
	});

	onDestroy(() => {
		if (ws) ws.close();
	});

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

	const screens = ['Background', 'Combat', 'Overlays', 'Presets'];
	let currentScreen = 'Combat';
</script>

<!-- <svelte:window on:beforeunload={beforeUnload} /> -->

{#if $playerStateStore}
	<div class="flex flex-col justify-start">
		<!-- 
			HEADING 
		-->
		<div class="flex flex-row items-center justify-between">
			<h1 class="text-3xl">Session Driver</h1>
			<SessionHeader {ws} />
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
		<!-- 
			BODY 
		-->
		<div class="border-solid border rounded-lg border-gray-600 p-3 my-3">
			<ScrollBox items={screens} bind:currentItem={currentScreen} />

			{#if currentScreen == 'Overlays'}
				<OverlayManager {ws} bind:imageSelectionMode bind:selectionOpen />
			{:else if currentScreen == 'Background'}
				<div class="flex gap-3 justify-start">
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
			{/if}
			{#if currentScreen == 'Overlays'}
				<MapSelect
					on:click={(e) => {
						console.log(e.detail);
						ws.setMap({
							map_data: { ...e.detail, transition: 3000 },
							display: $playerStateStore.map_display,
							map_id: $playerStateStore.map_image_id
						});
					}}
				/>
			{:else if currentScreen == 'Background'}
				<DisplayImage image_id={$playerStateStore.background_image_id} />
			{:else if currentScreen == 'Presets'}
				<PresetManager {ws} />
			{:else if $playerStateStore && !$playerStateStore.combat}
				<DataTable
					{ws}
					on:runCombat={(e) => {
						ws.updateCombat({ combat: e.detail.combat });
					}}
					on:newCombat={(e) => {
						ws.updateCombat({ combat: e.detail.combat });
					}}
				/>
			{:else if $playerStateStore && $playerStateStore.combat}
				{#if $combat}
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
						<Button on:click={commenceCombat}>
							<Swords class="h-4 w-4 mr-2" /> Commence Combat: Roll for Initiative
						</Button>
						<HitPointTable controller={ws} />
					{:else}
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
						<div>
							<CombatInitiativeOrder controller={ws} on:combat_updated={handleCombatUpdate} />
						</div>
					{/if}
				{/if}
			{/if}
		</div>
	</div>
{:else}
	An unexpected error occurred. Could not find session_id.
{/if}

<Sheet.Root bind:open={selectionOpen}>
	<Sheet.Content side="right" class="overflow-y-scroll sm:max-w-[100%]">
		<ImageSelection
			imageType={imageSelectionMode}
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
				} else if (imageSelectionMode == 'handout') {
					if (e.detail.collection) return;
					ws.setHandout({
						display: $playerStateStore.handout_display,
						handout_id: e.detail.imageData
					});
				} else if (imageSelectionMode == 'map') {
					if (e.detail.collection) return;
					ws.setMap({
						display: $playerStateStore.map_display,
						map_id: e.detail.imageData,
						map_data: undefined
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
	</Dialog.Content>
</Dialog.Root>
