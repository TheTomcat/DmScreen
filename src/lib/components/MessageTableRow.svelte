<script lang="ts">
	import type { components } from '$lib/api/v1';
	import { FileEdit } from 'lucide-svelte';
	type Message = components['schemas']['Message'];
	export let message: Message;
</script>

<div class="tablerow">
	<div class="idbox">{message.message_id}</div>
	<div class="messagebox">{@html message.message}</div>
	<div class="icons"><FileEdit /></div>
</div>

<style>
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
</style>
