<script lang="ts">
	import type { Entity } from '../../../../app';

	import { Button } from '$lib/components/ui/button';
	import { createEventDispatcher } from 'svelte';
	import { PlusSquare } from 'lucide-svelte';

	export let entity: Entity;

	const dispatch = createEventDispatcher<{
		selectEntity: { entity: Entity };
	}>();
</script>

<Button
	class="p-1 h-[unset] flex items-center mx-2"
	on:click={() => {
		dispatch('selectEntity', { entity });
	}}
>
	<PlusSquare class="h-4 w-4" />
</Button>
