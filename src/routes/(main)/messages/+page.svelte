<script lang="ts">
	import type { Message } from '../../../app';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import MessageTableRow from '$lib/components/MessageTableRow.svelte';
	import InputBox from '$lib/components/InputBox.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { apiCreateNewMessage } from '$lib/api';
	import type { PageData } from './$types';
	import client from '$lib/api/index.js';
	import type { components } from '$lib/api/v1';
	import { flip } from 'svelte/animate';
	import { goto } from '$app/navigation';
	import PaginationStub from '$lib/components/PaginationStub.svelte';

	export let data: PageData;

	let pageSize = data.data?.size || 20;
	$: totalItems = data.data?.total || 0;
	$: totalPages = Math.ceil(totalItems / pageSize) || 1;

	let allMessages: Message[] = [];
	let state: 'loading' | 'error' | 'done' = 'done';
	let error;

	let dialogVisible: boolean = false;
	let dialog: HTMLDialogElement;
	let newMessage: string;

	const searchParams = new URLSearchParams('page=1');
	let currentPage: number = 1;
	let filterString: string = '';
	$: currentPage = parseInt($page.url.searchParams.get('page')?.toString() || '1');
	// $: filterString = $page.url.searchParams.get('q') || '';

	onMount(() => {
		if (data.error || !data.data) {
			state = 'error';
			return;
		}
		allMessages = data.data?.items || [];
		state = 'done';
	});

	const go = () => {
		goto(`?${searchParams.toString()}`, { replaceState: true }).then(() => {
			if (data.data) {
				allMessages = data.data?.items || [];
				state = 'done';
			}
		});
	};

	const changePage = (newPage: number) => {
		searchParams.set('page', newPage.toString());
		state = 'loading';
		go();
	};

	// let messages: Awaited<ReturnType<typeof getMessages>> | undefined;

	async function getMessages(message: string, page: number, size: number) {
		return client.GET('/message/', {
			params: { query: { message, page, size } }
		});
	}

	const createMessage = (message: string) => {
		return client
			.POST('/message/', {
				body: { message }
			})
			.then((res) => {
				if (res.data) {
				}
			});
	};
	// const changePage = (e: { currentPage: number }) => {
	// 	getMessages(filterString, e.currentPage, pageSize).then((response) => {
	// 		if (response.data) allMessages = response.data?.items;
	// 		console.log(response);
	// 	});
	// };
</script>

<h1>Messages</h1>
<!-- <form id="sbmt"> -->
<!-- <div class="container"> -->
<div class="input">
	<InputBox placeholder={"You could enter text here to filter, but I haven't programmed it yet"} />

	<!-- />on:submit={console.log} -->
	<button on:click={() => (dialogVisible = true)}>Create New</button>
	<div class="paginationdetails">
		<PaginationStub {currentPage} {totalItems} {pageSize} />
	</div>
</div>
<!-- </div> -->
<!-- {#if state === 'error'}
	An error occurred...
{:else if state === 'loading'}
	Loading...
{:else} -->
<div class="messagetable">
	{#each allMessages as message (message.message_id)}
		<div animate:flip>
			<MessageTableRow {message} />
		</div>
	{/each}
</div>
<div class="pagination">
	<Pagination {currentPage} numPages={totalPages} on:change={(e) => changePage(e.detail)} />
</div>

<!-- </form> -->
<Modal
	bind:showModal={dialogVisible}
	bind:dialog
	params={{ allowCasualDismiss: false, showClose: true }}
>
	<h2 slot="header">New Message</h2>
	<div class="grid">
		<textarea bind:value={newMessage} placeholder="Enter a message" />
	</div>
	<button
		slot="footer"
		class="submitbutton"
		on:click={(e) => {
			console.log(newMessage);
			dialog.close();
			createMessage(newMessage);
			newMessage = '';
		}}>Create</button
	>
</Modal>

<!-- {/if} -->

<!-- .filter((message) => {
	return message.message.toLowerCase().includes(filterString);
}) -->

<style>
	.input {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr;
		align-items: center;
		justify-content: space-between;
	}
	.messagetable {
		width: 100%;
	}
	.grid {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}
	.currentpage {
		color: greenyellow;
	}
	.pagination {
		padding-block: var(--size-3);
	}
	.paginationdetails {
		text-align: right;
	}
	.submitbutton {
		background-color: var(--brand-background);
	}
</style>
