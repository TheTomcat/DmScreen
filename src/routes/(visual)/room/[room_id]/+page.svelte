<script lang="ts">
	import BackgroundEffect from '$lib/components/BackgroundEffect.svelte';
	import BackgroundImage from '$lib/components/BackgroundImage.svelte';
	import BackgroundMessage2 from '$lib/components/BackgroundMessage2.svelte';
	import CombatManager from '$lib/components/CombatManager.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { wsReciever, playerStateStore, initialise } from '$lib/ws';
	import { onDestroy, onMount } from 'svelte';

	import { scale } from 'svelte/transition';
	import { page } from '$app/stores';
	let session_id = 1;
	let debugmode: boolean = true;
	let ws: wsReciever;
	onMount(() => {
		ws = new wsReciever(`/live/socket/${session_id}`);
		initialise();
	});
	onDestroy(() => {
		if (ws) ws.close();
	});
</script>

{#if $playerStateStore}
	<!-- {@debug $playerStateStore} -->
	{#if $playerStateStore.mode == 'idle'}
		<BackgroundEffect n={50} />
	{:else if $playerStateStore.mode == 'loading' || $playerStateStore.mode == 'backdrop' || $playerStateStore.mode == 'combat'}
		{#if $playerStateStore.background_image_display}
			<BackgroundImage
				bind:image_id={$playerStateStore.background_image_id}
				cycleImageTimeout={$playerStateStore.background_image_timeout}
				bind:cycleImage={$playerStateStore.background_image_cycle}
			/>
		{/if}
		{#if $playerStateStore.mode == 'loading'}
			<Spinner />
			<!-- {/if}
		{#if $playerStateStore.message_display} -->
			<BackgroundMessage2 message_id={$playerStateStore.message_id} cycleMessageTimeout={30000} />
		{/if}
	{/if}
	{#if $playerStateStore.mode == 'combat'}
		<CombatManager />
		<!-- combat={$playerStateStore.combat} /> -->
		<!-- {:else if $playerStateStore.mode == 'handout'}{:else if $playerStateStore.mode == 'map'} -->
	{/if}
	{#if $playerStateStore.announce_text}
		<div class="messagecontainer">
			<div class="messagebox" transition:scale>
				<h1>{$playerStateStore.announce_text}</h1>
				<!-- <BouncingText /> -->
			</div>
		</div>
	{/if}
{/if}
<div class="status" class:debug={debugmode}>
	{JSON.stringify($playerStateStore)}
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
	.status {
		position: absolute;
		bottom: 0;
		height: 20px;
		width: 100%;
		padding-inline: 5px;
		background-color: rgba(255, 255, 255, 0.4);
	}
</style>
