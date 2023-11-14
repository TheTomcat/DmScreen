<script lang="ts">
	import { capitalise } from '$lib';
	import { CircleDashed, EarOff, EyeOff, FlaskConical, Ghost, Sparkles, Zap } from 'lucide-svelte';

	export let condition: string;
	const options = [
		{ condition: 'blinded', component: EyeOff },
		{ condition: 'charmed', component: Sparkles },
		{ condition: 'deafened', component: EarOff },
		{ condition: 'frightened', component: Ghost },
		{ condition: 'grappled', component: undefined },
		{ condition: 'incapacitated', component: undefined },
		{ condition: 'invisible', component: CircleDashed },
		{ condition: 'petrified', component: undefined },
		{ condition: 'poisoned', component: FlaskConical },
		{ condition: 'restrained', component: undefined },
		{ condition: 'stunned', component: Zap },
		{ condition: 'unconscious', component: undefined },
		{ condition: 'exhausted', component: undefined },
		{ condition: 'concentrating', component: undefined }
	];

	$: selected = options.find((c) => c.condition == condition)?.component;
</script>

{#if selected}
	<svelte:component this={selected} />
{:else}
	<span class="condition">{capitalise(condition)}</span>
{/if}

<style>
	.condition {
		background-color: var(--brand);
		color: black;
		border-radius: var(--size-3);
		box-shadow: var(--size-2) var(--size-2) var(--size-1) var(--surface-3);
		cursor: default;
		margin-inline: var(--size-2);
	}
</style>
