<script lang="ts">
	import type { Message } from '../../../app';
	import { onMount } from 'svelte';

	import MessageTableRow from '../../../components/MessageTableRow.svelte';
	import InputBox from '../../../components/InputBox.svelte';

	export let data;
	let allMessages: Message[] = [];

	onMount(() => {
		allMessages = data.messages;
	});

	let filterString: string = '';
</script>

<h1>Messages</h1>
<form id="sbmt">
	<InputBox bind:value={filterString} placeholder={'Filter'} />
	<div class="messagetable">
		{#each allMessages.filter((message) => {
			return message.message.toLowerCase().includes(filterString);
		}) as message (message.message_id)}
			<MessageTableRow {message} />
		{/each}
	</div>
</form>

<style>
	.messagetable {
		width: 100%;
	}
</style>
