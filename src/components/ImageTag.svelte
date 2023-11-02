<script lang="ts">
	import type { Tag } from '../app';
	import { X } from 'lucide-svelte';
	export let tag: Tag; //: string;
	export let onClick: VoidFunction;
</script>

<button class="tagbutton" on:click={onClick}>{tag.tag} <X /></button>

<style>
	button {
		background-color: var(--brand);
		color: black;
		border-radius: var(--size-3);
		box-shadow: var(--size-2) var(--size-2) var(--size-1) var(--surface-3);
	}
</style>
