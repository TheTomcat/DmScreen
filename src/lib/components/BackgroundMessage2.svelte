<script lang="ts">
	import { browser } from '$app/environment';
	import client from '$lib/api/index';
	import { fade } from 'svelte/transition';
	import type { Message } from '../../app';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		changed: { message_id: number };
	}>();

	export let message_id: number | undefined;
	export let cycleMessageTimeout: number;
	// export let cycleMessage: boolean = false;
	let message: Message;
	$: {
		if (browser) {
			fetchMessage(message_id);
		}
	}

	const schedulePageUpdate = (timer = cycleMessageTimeout) => {
		setTimeout(() => {
			fetchMessage();
			schedulePageUpdate(timer);
		}, timer);
	};

	const fetchMessage = (message_id: number | undefined = undefined) => {
		getMessageData(message_id).then((response) => {
			console.log(
				`Fetching message data: <Message ${response.data?.message_id}>: ${
					response.data ? 'got!' : `fail: ${response.error}`
				}`
			);
			if (response.data) {
				dispatch('changed', { message_id: response.data.message_id });
				message = response.data;
			}
		});
	};

	const getMessageData = (message_id: number | undefined) => {
		if (message_id)
			return client.GET('/message/{message_id}', { params: { path: { message_id } } });
		return client.GET('/message/random/', { params: { query: { image_type: 'backdrop' } } });
	};
</script>

{#if message && message.message}
	<div class="messagebox" transition:fade>{@html message.message}</div>
{/if}

<style>
	.messagebox {
		width: 70%;
		margin: auto;
		opacity: 0.9;
		text-align: center;
		bottom: 130px;
		left: 15%;
		position: absolute;
		color: antiquewhite;
		font-size: 48pt;
		-webkit-text-stroke: 2px #333;
		text-shadow: 3px 3px 0 #333, -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333;
		background-color: rgba(216, 216, 216, 0.4);
		border-radius: 10px;
		padding-left: 1rem;
		padding-right: 1rem;
	}
</style>
