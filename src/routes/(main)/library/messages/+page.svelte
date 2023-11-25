<script lang="ts">
	import { Pencil, FileEdit } from 'lucide-svelte';
	import type { Message } from '../../../../app';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import InputBox from '$lib/components/InputBox.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageData } from '../../messages/$types';
	import client from '$lib/api/index.js';
	import type { components } from '$lib/api/v1';
	import { flip } from 'svelte/animate';
	import { goto } from '$app/navigation';
	import PaginationStub from '$lib/components/PaginationStub.svelte';
	import { PlusSquare } from 'lucide-svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	export let data: PageData;
	let state: 'done' | 'error' | 'loading';

	let pageSize = data.data?.size || 20;
	$: totalItems = data.data?.total || 0;
	$: totalPages = Math.ceil(totalItems / pageSize) || 1;

	let allMessages: Message[] = [];

	let dialogMode: 'edit' | 'create' = 'create';
	let dialog: Dialog; //HTMLDialogElement;
	let currentMessage: Message;

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

	const handleClose = (e: CustomEvent<{ returnValue: string }>) => {
		if (e.detail.returnValue != 'confirm') return;
		if (dialogMode == 'create') {
			client.POST('/message/', { body: { message: currentMessage.message } });
		} else {
			client
				.PATCH('/message/{message_id}', {
					params: { path: { message_id: currentMessage.message_id } },
					body: { message: currentMessage.message }
				})
				.then((response) => {
					if (!response.data) return;
					allMessages[
						allMessages.findIndex((m) => m.message_id == response.data.message_id)
					].message = response.data.message;
				});
		}
	};
	const handleClick = (message: Message | undefined = undefined) => {
		if (!message) {
			dialogMode = 'create';
			currentMessage = { message: '', message_id: -1 };
		} else {
			dialogMode = 'edit';
			currentMessage = message;
		}

		dialog.open();
	};
</script>

<h1>Messages</h1>

<div class="input">
	<InputBox placeholder={"You could enter text here to filter, but I haven't programmed it yet"} />

	<button on:click={(e) => handleClick()}><PlusSquare />Create New</button>
	<div class="paginationdetails">
		<PaginationStub {currentPage} {totalItems} {pageSize} />
	</div>
</div>

<div class="messagetable">
	{#each allMessages as message (message.message_id)}
		<div
			class="tablerow"
			animate:flip
			role="row"
			tabindex="0"
			on:click={() => handleClick(message)}
			on:keydown={() => handleClick(message)}
		>
			<div class="idbox">{message.message_id}</div>
			<div class="messagebox">{@html message.message}</div>
			<!-- <div class="icons"><FileEdit /></div> -->
		</div>
	{/each}
</div>
<div class="pagination">
	<Pagination {currentPage} numPages={totalPages} on:change={(e) => changePage(e.detail)} />
</div>
<Dialog mode="mega" bind:this={dialog} on:closed={handleClose}>
	<section class="icon-header" slot="header">
		{#if dialogMode == 'edit'}<Pencil />{:else}<PlusSquare />{/if}
		<h3>
			{#if dialogMode == 'edit'}Edit {:else}New {/if}Message
		</h3>
	</section>
	<svelte:fragment slot="content">
		{#if currentMessage}
			<textarea
				style="width: 500px; height: 300px;"
				bind:value={currentMessage.message}
				placeholder="Enter a message"
			/>
		{/if}
	</svelte:fragment>
</Dialog>

<style>
	.input {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-3);
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
	.tablerow {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
		gap: var(--size-1);
		padding-block: var(--size-1);
	}
	.tablerow:hover {
		background-color: var(--surface-4);
	}
	.idbox {
		width: var(--size-8);
		text-align: center;
	}

	.messagebox {
		text-align: left;
		width: 100%;
	}
	.icons {
		opacity: 0;
		display: flex;
		flex-direction: row;
		height: 100%;
		white-space: nowrap;
		width: fit-content;
		align-items: center;
	}
	.tablerow:hover .icons {
		opacity: 1;
		transition: opacity 0.2s;
	}
	.icon-header {
		display: flex;
		gap: var(--size-3);
		align-items: center;
	}
</style>
