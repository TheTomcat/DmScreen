<script lang="ts">
	import BackgroundEffect from '$lib/components/BackgroundEffect.svelte';
	import BackgroundImage from '$lib/components/BackgroundImage.svelte';
	import BackgroundMessage2 from '$lib/components/BackgroundMessage2.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { playerStateStore, combat, initialise, activeParticipant, wsReciever } from '$lib/ws';
	import { onDestroy, onMount } from 'svelte';

	import { scale } from 'svelte/transition';
	import { page } from '$app/stores';
	import PlayerCombatView from '$lib/components/new/PlayerCombatView.svelte';
	import { capitalise, get_next_PC, is_dead } from '$lib';
	import { browser } from '$app/environment';
	import client from '$lib/api/index';
	import type { Image, ImageURL } from '../../../../app';
	import Handout from '$lib/components/new/Handout.svelte';
	import Map from '$lib/components/new/Map.svelte';
	// import BouncingText from '$lib/components/textEffects/BouncingText.svelte';
	// import GlitchText from '$lib/components/textEffects/GlitchText.svelte';
	// import SquiggleText from '$lib/components/textEffects/SquiggleText.svelte';
	let room_id = $page.params.room_id;
	let ws: wsReciever;
	let activeParticipantImage: ImageURL | undefined;
	onMount(() => {
		ws = new wsReciever(`/live/socket/${room_id}`);
		initialise();
	});
	onDestroy(() => {
		if (ws) ws.close();
	});

	$: {
		if (browser && $activeParticipant && $activeParticipant.image_id) {
			client
				.GET('/image/{image_id}', { params: { path: { image_id: $activeParticipant.image_id } } })
				.then((response) => {
					if (response.data) {
						activeParticipantImage = response.data;
						return;
					}
					activeParticipantImage = undefined;
					return;
				});
		} else {
			activeParticipantImage = undefined;
		}
	}
</script>

<div class="overflow-hidden w-screen h-screen">
	{#if !room_id}
		Invalid Room Id
	{:else if $playerStateStore}
		<!-- {@debug $playerStateStore} -->
		{#if !$playerStateStore.background_image_display}
			<BackgroundEffect n={50} />
		{:else if $playerStateStore.background_image_display}
			<BackgroundImage
				on:changed={(e) => {
					ws.notifyBackgroundImage({ image_id: e.detail.image_id });
				}}
			/>
		{/if}
		{#if $playerStateStore.spinner_display}
			<Spinner />
		{/if}
		{#if $playerStateStore.message_display}
			<BackgroundMessage2
				message_id={$playerStateStore.message_id}
				cycleMessageTimeout={$playerStateStore.message_timeout}
				cycleMessage={$playerStateStore.message_cycle}
			/>
		{/if}

		{#if $playerStateStore.combat_display && $combat}
			<div class="combatcontainer">
				<div class="overlay combatants">
					<!-- <div class="flex flex-col items-center justify-start" > -->

					<h3 class="text-center text-2xl text-shadow">{$combat.title}</h3>
					<div class="text-center text-sm text-shadow mb-3">Round {$combat.round}</div>
					<PlayerCombatView />
					<!-- </div> -->
				</div>
				<div class="overlay name">
					{#if $activeParticipant}
						<h1 class="text-shadow text-4xl pb-3">
							{$activeParticipant.name}
						</h1>
						<p>
							{#if $activeParticipant?.conditions}
								{#each $activeParticipant.conditions.split(',') as condition}
									<span class="condition">{capitalise(condition)}</span>
								{/each}
							{/if}
							{#if is_dead($activeParticipant)}
								<span class="condition">Unconscious</span>
							{/if}
						</p>
					{/if}
				</div>
				<div class="portrait">
					{#if activeParticipantImage}
						<img
							src={`/api/${activeParticipantImage.url}`}
							alt={activeParticipantImage.name}
							class="shadow-lg"
						/>
					{:else}
						<Spinner centerScreen={false} />
					{/if}
				</div>
				<div class="overlay upnext">
					{#if $activeParticipant && $combat}
						<h3>Up Next:</h3>
						<h2 class="text-2xl text-shadow">
							{$combat.participants.find(
								(p) =>
									$activeParticipant &&
									$playerStateStore.combat &&
									p.participant_id ==
										get_next_PC(
											$activeParticipant.participant_id,
											$playerStateStore.combat.participants
										).next_participant_id
							)?.name}
						</h2>
					{/if}
				</div>
			</div>
		{/if}
		<!-- combat={$playerStateStore.combat} /> -->
		<!-- {:else if $playerStateStore.mode == 'handout'}{:else if $playerStateStore.mode == 'map'} -->
		{#if $playerStateStore.announce_display}
			<div class="messagecontainer">
				<div class="messagebox announcement" transition:scale>
					<h1 class="text-6xl">{$playerStateStore.announce_text}</h1>
					<!-- <SquiggleText text={$playerStateStore.announce_text} /> -->
				</div>
			</div>
		{/if}
		{#if $playerStateStore.handout_display}
			<div class="handoutcontainer">
				<div class="messagebox handoutbox h-[90vh]" transition:scale>
					<Handout />
				</div>
			</div>
		{/if}
		{#if $playerStateStore.map_display}
			<div class="handoutcontainer">
				<div class="messagebox handoutbox h-[90vh]" transition:scale>
					<Map />
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- <div class="status" class:debug={debugmode}>
	{JSON.stringify($playerStateStore)}
</div> -->

<style>
	.text-shadow {
		text-shadow: 0.05em 0 black, 0 0.05em black, -0.05em 0 black, 0 -0.05em black,
			-0.05em -0.05em black, -0.05em 0.05em black, 0.05em -0.05em black, 0.05em 0.05em black;
	}
	.announcement {
		background: radial-gradient(rgba(150 150 150/ 0.9), rgba(20 20 20/ 0.4));
		box-shadow: 0.05em 0 black, 0 0.05em black, -0.05em 0 black, 0 -0.05em black,
			-0.05em -0.05em black, -0.05em 0.05em black, 0.05em -0.05em black, 0.05em 0.05em black;

		text-shadow: 0.05em 0 black, 0 0.05em black, -0.05em 0 black, 0 -0.05em black,
			-0.05em -0.05em black, -0.05em 0.05em black, 0.05em -0.05em black, 0.05em 0.05em black;
	}
	.messagecontainer {
		backdrop-filter: blur(10px);
		position: absolute;
		width: 100%;
		height: 100%;
		transition: opacity 2s;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.messagebox {
		z-index: 10;
		position: absolute;
		/* top: 50%;
		left: 50%; */
		/* transform: translate3d(-50%, -50%, 0); */
		font-size: xx-large;
		/* background: ; */
		width: 80%;
		height: 250px;

		text-align: center;
		border-radius: 1rem;
		box-shadow: var(--shadow-3);
		display: flex;
		flex-direction: column;
		justify-content: center;
		transition: opacity 2s;
	}
	.handoutcontainer {
		backdrop-filter: blur(10px);
		position: absolute;
		transition: opacity 2s;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.handoutbox {
		height: unset;
		background: unset;
		width: unset;
	}
	.messagebox h1 {
		max-inline-size: unset;
	}
	.hidden {
		opacity: 0;
		transition: opacity 2s;
	}
	.status {
		position: absolute;
		bottom: 0;
		height: 20px;
		width: 100%;
		padding-inline: 5px;
		background-color: rgba(255, 255, 255, 0.4);
	}
	.combatcontainer {
		position: absolute;
		width: 100%;
		height: 100%;
		display: grid;
		column-gap: 2rem;
		row-gap: 2rem;
		padding: 2rem;
		grid-template-columns: 2fr 3fr;
		grid-template-rows: 1fr minmax(0, 6fr) 0.5fr;
		height: 100%;
		max-height: 100%;

		/* background-color: red; */
	}
	.condition {
		padding-inline: 1rem;
		padding-block: 0.25rem;
		margin: var(--size-2);
		background-color: #333;
		border-radius: 1rem;
	}
	.overlay {
		background-color: rgba(216, 216, 216, 0.2);
		border-radius: 1rem;
		/* opacity: 0.8; */
		align-self: stretch;
		justify-self: stretch;
		/* border-radius: var(--radius-3); */
		padding: 1rem;
	}
	.combatants {
		grid-area: 1 / 1 / 4 / 2;
		/* background-color: antiquewhite; */
	}
	.portrait {
		grid-area: 2 / 2 / 3 / 3;
		border-radius: 1rem;
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
		padding-top: 0.5rem;
		background: radial-gradient(rgba(50 50 50/ 0.8), rgb(255 255 255 / 0.2));
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
		box-shadow: rgba(3, 4, 7, 0.12) 0px -1px 2px 0px, rgba(3, 4, 7, 0.13) 0px 2px 1px -2px,
			rgba(3, 4, 7, 0.13) 0px 5px 5px -2px, rgba(3, 4, 7, 0.14) 0px 10px 10px -2px,
			rgba(3, 4, 7, 0.15) 0px 20px 20px -2px, rgba(3, 4, 7, 0.17) 0px 40px 40px -2px;
		border-radius: 1rem;

		/* opacity: 1; */
	}
</style>
