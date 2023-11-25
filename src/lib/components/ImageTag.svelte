<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Tag } from '../../app';
	import { createEventDispatcher } from 'svelte';
	export let tag: Tag;
	export let interactive: boolean = true;
	export let highlight: boolean = false;
	export let small: boolean = false;
	let dispatch = createEventDispatcher<{ click: undefined; clickclose: undefined }>();
</script>

<button
	class="tagbutton"
	class:interactive
	class:small
	class:highlight
	on:click={() => dispatch('click')}
>
	{tag.tag}
	{#if interactive}
		<span
			role="button"
			class="close"
			class:interactive
			tabindex="0"
			on:click={() => dispatch('clickclose')}
			on:keydown={() => dispatch('clickclose')}
		>
			<X />
		</span>
	{/if}
</button>

<style>
	.small {
		font-size: small;
	}
	button {
		background-color: var(--brand);
		color: black;
		border-radius: var(--radius-4);
		box-shadow: var(--shadow-4);
		margin-inline: var(--size-1);
		cursor: default;
	}
	.highlight {
		background-color: var(--brand-background);
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
