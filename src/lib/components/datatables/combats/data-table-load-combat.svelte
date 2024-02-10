<script lang="ts">
	import ImageTag from '$lib/components/ImageTag.svelte';
	import { Image, ImageOff, Link, Play, Subtitles } from 'lucide-svelte';
	import type { Combat, Entity, EntityByID, Tag } from '../../../../app';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Statblock from '$lib/components/new/EntityDisplay/Statblock.svelte';

	import type { ImageURL } from '../../../../app';
	import * as Popover from '$lib/components/ui/popover';
	import PopoverContent from '$lib/components/ui/popover/popover-content.svelte';
	import client from '$lib/api/index';
	import type { wsController } from '$lib/ws';
	import { createEventDispatcher } from 'svelte';

	export let combat: Combat;
	export let ws: wsController | undefined = undefined;

	// let entity: Entity;
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
