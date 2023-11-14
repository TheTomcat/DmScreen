<script lang="ts">
	import { Crown, PlusSquare, Rat } from 'lucide-svelte';
	// import type { Entity, Participant, RollMode } from '';
	import type { Entity } from '../../app';

	export let entity: Entity;
</script>

<div class="row">
	<div class="entityname">{entity.name}</div>
	<div class="icons">
		<slot />
		<!-- <button on:click={() => _handleClick('one')}><Rat /></button>
		<button on:click={() => _handleClick('max')}><Crown /></button>
		<button on:click={() => _handleClick('default')}><PlusSquare /></button> -->
	</div>
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
		gap: var(--size-1);
		padding-block: var(--size-1);
		/* animation: var(--animation-fade-in) forwards, var(--animation-slide-in-left);
		animation-timing-function: var(--ease-in-out-3);
		animation-duration: 0.5s; */
		cursor: pointer;
	}
	.row:hover {
		background-color: var(--surface-4);
	}
	.entityname {
		text-align: left;
	}
	.icons {
		height: 100%;
		white-space: nowrap;
		width: fit-content;
		align-items: center;
		opacity: 0;
	}
	.row:hover .icons {
		transition: opacity 0.2s var(--ease-in-out-3);
		/*animation: var(--animation-fade-in) forwards, var(--animation-slide-in-top);*/
		opacity: 1;
	}
	.row:nth-child(odd) {
		background-color: var(--surface-3);
	}
</style>
