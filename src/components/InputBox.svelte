<script lang="ts">
	import { X } from 'lucide-svelte';

	export let value: string = '';
	export let placeholder: string = '';
</script>

<div class="wrapper">
	<input class="inputbox" autocomplete="off" {placeholder} bind:value />
	<span class="close"><X /></span>
</div>

<style>
	.inputbox {
		width: 100%;
		margin-block: var(--size-5);
		cursor: text;
	}
	.wrapper {
		position: relative;
	}
	.wrapper .close {
		position: absolute;
		right: 15px;
		top: 26px;
		cursor: pointer;
	}
</style>
