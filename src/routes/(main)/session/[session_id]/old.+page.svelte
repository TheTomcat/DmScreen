<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	import { sessionStore, type Session, refresh } from '$lib/stores/sessionStore.js';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Megaphone } from 'lucide-svelte';
	import CombatManager from '$lib/components/old/CombatManager.svelte';

	let playerScreenMode: string;
	let ws: WebSocket;

	let session_id: number = parseInt($page.params.session_id);
	onMount(() => {
		if (!browser) return;
		refresh(session_id);
		// playerScreenMode = $sessionStore.mode;
	});

	const connect = (endpoint: string) => {
		let path = new URL(`${endpoint}`, window.location.toString());
		path.protocol = 'ws:';
		ws = new WebSocket(path);
		//ws.onmessage = console.log;
	};

	$: {
		if ($sessionStore && $sessionStore.ws_url) {
			if (ws && ws.readyState == ws.OPEN) {
				ws.close();
			}
			console.log('Connect');
			connect($sessionStore.ws_url);
		}
	}

	const update = (e: any) => {
		ws.send(
			JSON.stringify({ event: 'update', combat: $sessionStore.combat }) // next_participant: e.detail.active_participant_id })
		);
	};
</script>

{#if $sessionStore}
	<div class="sessioncontainer">
		<div class="sessionheader">
			<h1>Session Driver</h1>
			<div><span />Connection</div>
		</div>
		<div class="main">
			<h3>Session Controls</h3>
			<div class="controls">
				<div>
					Now editing:
					<select value={$sessionStore.mode}>
						<option disabled value={'empty'}>Empty</option>
						<option value={'backdrop'}>Backdrop</option>
						<option value={'loading'}>Loading</option>
						<option value={'combat'}>Combat</option>
						<option value={'handout'}>Handout</option>
						<option value={'map'}>Map</option>
					</select>
				</div>
				<div>
					Current Player Screen Mode: {$sessionStore.mode}.
					<select>
						<option value={'empty'}>Empty</option>
						<option value={'backdrop'}>Backdrop</option>
						<option value={'loading'}>Loading</option>
						<option value={'combat'}>Combat</option>
						<option value={'handout'}>Handout</option>
						<option value={'map'}>Map</option>
					</select>
					<button disabled={playerScreenMode == $sessionStore.mode}>Change</button>
				</div>
				<div>
					<input />
					<button>Announce<Megaphone /></button>
				</div>
			</div>
		</div>
		<div class="main">Backdrop/Loading Image</div>
		<div class="main">
			{#if $sessionStore.combat_id}
				<CombatManager
					combat_id={$sessionStore.combat_id}
					on:advance_combat={update}
					on:begin_combat={update}
					on:suspend_combat={update}
				/>
			{/if}
		</div>
		<div class="main">Overlay</div>
	</div>
{:else}
	An unexpected error occurred. Could not find session_id.
	<!-- <div class="container">
		<div
		style="display: flex; flex-direction: row; justify-content: space-between; grid-row: 1 / span 4;"
		>
		<h1 style="max-inline-size: unset;">Session Manager: {$sessionStore.title}</h1>
		<div><span class="circle" />Connection status</div>
	</div>
		<select value={$sessionStore.mode}>
			<option disabled value={'empty'}>Empty</option>
			<option value={'backdrop'}>Backdrop</option>
			<option value={'loading'}>Loading</option>
			<option value={'combat'}>Combat</option>
			<option value={'handout'}>Handout</option>
			<option value={'map'}>Map</option>
		</select>
		<div>
			<h2>Background Image</h2>
			{#if $sessionStore.mode != 'empty' && $sessionStore.backdrop}
				<img src={`/api/${$sessionStore.backdrop.thumbnail_url}`} />
				ID: <input placeholder="Image ID" value={$sessionStore.backdrop_id} />
			{/if}
		</div>
		<div>Message</div>
		<div>Handout</div>
		<div>Map</div>
		<div>Combat</div>
		<button
			on:click={() => {
				toast.push('changes confirmed');
			}}>Confirm Changes</button
		>
	</div> -->
{/if}

<style>
	.sessioncontainer {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}
	.sessionheader,
	.controls {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
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
</style>
