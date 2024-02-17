<script lang="ts">
	import { Play } from 'lucide-svelte';
	import type { Combat } from '../../../../app';
	import { Button } from '$lib/components/ui/button';

	import type { wsController } from '$lib/ws';
	import { createEventDispatcher } from 'svelte';

	export let combat: Combat;
	export let ws: wsController | undefined = undefined;

	const dispatch = createEventDispatcher<{
		runCombat: { combat: Combat };
	}>();
</script>

{#if combat && ws}
	<Button
		class="h-[unset]"
		on:click={() => {
			dispatch('runCombat', { combat });
		}}
	>
		<Play class="w-4 h-4 mr-1" /> Run Combat
	</Button>
{/if}
