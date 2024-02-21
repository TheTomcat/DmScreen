<script lang="ts">
	import type { components } from '$lib/api/v1';
	import Spinner from '$lib/components/Spinner.svelte';
	import BackgroundImage from '$lib/components/BackgroundImage.svelte';
	import BackgroundMessage from '$lib/components/BackgroundMessage.svelte';
	import {
		sessionStore,
		refresh,
		type Session,
		setActiveParticipantID
	} from '$lib/stores/sessionStore';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import {
		capitalise,
		get_next_PC,
		get_next_participant_id,
		is_dead,
		smartName,
		sort_participants_naive
	} from '$lib';
	import client from '$lib/api/index';
	import { Cpu, Dices, Droplets } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import CombatInitiativeOrder from '../../../(main)/session/[session_id]/CombatInitiativeOrder.svelte';
	import BackgroundEffect from '$lib/components/BackgroundEffect.svelte';
	import { combat, loadCombat, set_active_participant } from '$lib/stores/combatStore';
	import BouncingText from '$lib/components/textEffects/BouncingText.svelte';

	type Image = components['schemas']['ImageURL'];
	type Participant = components['schemas']['Participant'];

	let state: 'loading' | 'error' | 'done';
	let session_id: number = parseInt($page.params.session_id);
	let activeParticipant: Participant | undefined;
	let activeParticipantImage: Image | undefined;
	let ws: WebSocket;

	let messageBoxVisiblity = false;
	let messageBoxText = '';

	const connect = (endpoint: string) => {
		let path = new URL(`${endpoint}`, window.location.toString());
		path.protocol = 'ws:';
		ws = new WebSocket(path);
		ws.addEventListener('message', wsEventHandler);
	};

	const wsEventHandler = (e: MessageEvent) => {
		// console.log('Event', e);
		let data = JSON.parse(e.data);
		switch (data.event) {
			case 'announce':
				console.log('announce');
				messageBoxText = data.message;
				break;
			case 'hideannounce':
				messageBoxVisiblity = false;
				break;
			case 'update':
				combat.set(data.combat);
			// case 'roll_initiative':
			// 	console.log('roll_initiative');
			// 	break;
			// case 'start_combat':
			// 	console.log('start_combat');
			// 	break;
			// case 'advance_combat':
			// 	console.log(`advance_combat: ${data.next_participant}`);
			// 	set_active_participant($combat.combat_id, data.next_participant);
			// 	// combat.update((combat) => data.combat);
			// 	break;
			default:
				console.log(data);
		}
	};

	// onMount(() => {
	// 	// if (!session_id || $sessionStore) {
	// 	// 	return;
	// 	// }
	// 	// console.log('Attempting to join websocket');
	// 	// let ws = new WebSocket($sessionStore.ws_url);
	// 	// ws.onmessage = (e: MessageEvent) => {
	// 	// 	console.log(e);
	// 	createPing();
	// });

	const createPing = (delay: number = 1000) => {
		let timer = setInterval(() => refresh(session_id), delay);
		onDestroy(() => {
			clearInterval(timer);
		});
	};

	$: {
		//Keep the session fresh
		if (browser) {
			refresh(session_id);
			state = 'done';
		}
	}

	$: {
		if ($sessionStore && $sessionStore.ws_url) {
			if (ws && ws.readyState == ws.OPEN) {
				ws.close();
			}
			console.log('Connect');
			connect($sessionStore.ws_url);
		}
	}

	$: {
		if ($sessionStore && $sessionStore.mode == 'combat') {
			loadCombat($sessionStore.combat_id);
		}
	}

	$: {
		if (browser && $combat) {
			//&& $sessionStore?.mode === 'combat' && $sessionStore?.combat && $combat) {
			let pid = $combat.active_participant_id;
			activeParticipant = $combat.participants.find((p) => p.participant_id == pid);
			console.log('updating 1');
		} else {
			activeParticipant = undefined;
		}
	}

	$: {
		if (browser && $combat) {
			// && $sessionStore && $sessionStore.mode == 'combat') {
			if (activeParticipant && activeParticipant.image_id) {
				console.log('updating 2');
				getImage(activeParticipant.image_id).then((response) => {
					activeParticipantImage = response.data;
				});
			} else {
				activeParticipantImage = undefined;
			}
		}
	}

	const getImage = (image_id: number) => {
		return client.GET('/image/{image_id}', { params: { path: { image_id } } });
	};
</script>

{#if state === 'loading'}
	<Spinner />
{:else if state === 'error'}
	An error occurred.
{:else if $sessionStore}
	{#if $sessionStore.mode === 'loading'}
		<!-- By this point state should be done -->
		<BackgroundImage />
		<Spinner />
		<BackgroundMessage message={$sessionStore.message.message} />
	{:else if $sessionStore.mode === 'backdrop'}
		<BackgroundImage />
	{:else if $sessionStore.mode === 'combat'}
		{#if $combat}
			<BackgroundImage />
			<!-- <BackgroundEffect /> -->
			<div class="container">
				<div class="overlay combatants">
					<h3 class="combatheading">{$sessionStore.combat.title}</h3>
					<CombatInitiativeOrder playerView={true} />
				</div>
				<div class="overlay name">
					{#if activeParticipant}
						<h1>
							{smartName(activeParticipant.participant_id, $sessionStore.combat.participants)}
						</h1>
						<p>
							{#if activeParticipant?.conditions}
								{#each activeParticipant.conditions.split(',') as condition}
									<span class="condition">{capitalise(condition)}</span>
								{/each}
							{/if}
							{#if is_dead(activeParticipant)}
								<span class="condition">Unconscious</span>
							{/if}
						</p>
					{/if}
				</div>
				<div class="portrait">
					{#if activeParticipantImage}
						<img src={`/api/${activeParticipantImage.url}`} />
					{:else}
						<Spinner centerScreen={false} />
					{/if}
				</div>
				<div class="overlay upnext">
					{#if activeParticipant && $sessionStore.combat}Up Next:
						<h2>
							{$combat.participants.find(
								(p) =>
									p.participant_id ==
									get_next_PC(activeParticipant.participant_id, $sessionStore.combat.participants)
										.next_participant
							)?.name}
						</h2>
					{/if}
				</div>
			</div>
		{/if}
	{:else if $sessionStore.mode === 'handout'}
		<div class="portrait">
			{#if $sessionStore.overlay_image}
				<img src={`/api/${$sessionStore.overlay_image.url}`} />
			{:else}
				<Spinner centerScreen={false} />
			{/if}
		</div>
	{:else if $sessionStore.mode === 'map'}
		Map
	{:else}
		Unknown mode
	{/if}
{/if}
<div class="messagecontainer" class:hidden={!messageBoxVisiblity}>
	<div class="messagebox" class:hidden={!messageBoxVisiblity}>
		<h1>{messageBoxText}</h1>
		<!-- <BouncingText /> -->
	</div>
</div>

<style>
	.messagecontainer {
		backdrop-filter: blur(10px);
		position: absolute;
		width: 100%;
		height: 100%;
		transition: opacity 2s;
	}
	.messagebox {
		z-index: 10;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%, -50%, 0);
		font-size: xx-large;
		background: var(--surface-4);
		width: 80%;
		height: 250px;

		text-align: center;
		border-radius: var(--size-3);
		box-shadow: var(--shadow-3);
		display: flex;
		flex-direction: column;
		justify-content: center;
		transition: opacity 2s;
	}
	.messagebox h1 {
		max-inline-size: unset;
	}
	.hidden {
		opacity: 0;
		transition: opacity 2s;
	}
	.container {
		position: absolute;
		width: 100%;
		height: 100%;
		display: grid;
		column-gap: var(--size-7);
		row-gap: var(--size-7);
		padding: var(--size-7);
		grid-template-columns: 1fr 2fr;
		grid-template-rows: 1fr minmax(0, 6fr) 0.5fr;
		height: 100%;
		max-height: 100%;

		/* background-color: red; */
	}
	.overlay {
		background-color: rgba(216, 216, 216, 0.2);
		/* opacity: 0.8; */
		align-self: stretch;
		justify-self: stretch;
		border-radius: var(--radius-3);
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
	.name {
		grid-area: 1/2/2/3;
		font-size: larger;
		text-align: center;
		text-shadow: var(--shadow-3);
	}
	.name h1,
	.name p {
		max-inline-size: unset;
		margin-block: var(--size-2);
	}
	.upnext {
		grid-area: 3/2/4/3;
		text-align: center;
	}
	.upnext h2 {
		max-inline-size: unset;
	}
	.portrait img {
		object-fit: contain;
		margin: auto;
		/* mix-blend-mode: multiply; */
		/* background-color: white; */

		overflow: hidden;
		height: 100%;
		border: 1px solid var(--gray-6);
		box-shadow: var(--shadow-5);

		/* opacity: 1; */
	}

	@keyframes slowpan {
		0% {
			transform: translate3d(-200px, -200px, 0) scale(1.4);
		}

		50% {
			transform: translate3d(0, 0, 0) scale(1.1);
		}

		100% {
			transform: translate3d(400px, -200px, 0) scale(1.5);
		}
	}
	.combatheading {
		text-align: center;
		padding-block: var(--size-2);
	}
	.condition {
		padding-inline: var(--size-2);
		margin: var(--size-3);
		margin-block: var(--size-4);
		border-radius: var(--radius-2);
		border: var(--border);
		background-color: var(--gray-10);
	}
</style>
