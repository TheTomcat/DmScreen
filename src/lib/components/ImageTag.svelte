<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Tag } from '../../app';
	import { createEventDispatcher } from 'svelte';
	export let tag: Tag;
	export let interactive: boolean = true;
	let dispatch = createEventDispatcher<{ click: undefined; clickclose: undefined }>();
</script>

<button class="tagbutton" class:interactive on:click={() => dispatch('click')}
	>{tag.tag}
	<span class="close" class:interactive on:click={() => dispatch('clickclose')}><X /></span></button
>

<style>
	button {
		background-color: var(--brand);
		color: black;
		border-radius: var(--radius-4);
		box-shadow: var(--shadow-4);
		margin-inline: var(--size-1);
		cursor: default;
		/* var(--size-2) var(--size-2) var(--size-1) var(--surface-3); */
	}

	.close.interactive {
		cursor: pointer;
	}
	button.interactive {
		cursor: default;
	}
	button.interactive {
		cursor: default;
	}
</style>
