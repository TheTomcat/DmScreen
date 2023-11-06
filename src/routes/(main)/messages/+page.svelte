<script lang="ts">
	import type { Message } from '../../../app';
	import { onMount } from 'svelte';

	import MessageTableRow from '../../../components/MessageTableRow.svelte';
	import InputBox from '../../../components/InputBox.svelte';
	import Modal from '../../../components/Modal.svelte';
	import { apiCreateNewMessage } from '$lib/api';

	export let data;
	let allMessages: Message[] = [];
	let dialogVisible: boolean = true;
	let newMessage: string = '';
	let dialog: HTMLDialogElement;
	onMount(() => {
		allMessages = data.messages;
	});

	let filterString: string = '';
</script>

<h1>Messages</h1>
<!-- <form id="sbmt"> -->
<InputBox bind:value={filterString} placeholder={'Filter'} />
<div class="messagetable">
	{#each allMessages.filter((message) => {
		return message.message.toLowerCase().includes(filterString);
	}) as message (message.message_id)}
		<MessageTableRow {message} />
	{/each}
</div>
<!-- </form> -->
<Modal bind:showModal={dialogVisible} bind:dialog allowCasualDismiss={false}>
	<h2 slot="header">New Message</h2>
	<div class="grid">
		<textarea bind:value={newMessage} placeholder="Enter a message" />
		<button
			on:click={(e) => {
				console.log(newMessage);
				dialog.close();
				apiCreateNewMessage(fetch, newMessage).then((message) => {
					allMessages.push(message);
				});
			}}>Create</button
		>
	</div>
</Modal>

<style>
	.messagetable {
		width: 100%;
	}
	.grid {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}
</style>
