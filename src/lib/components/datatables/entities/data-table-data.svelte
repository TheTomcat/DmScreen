<script lang="ts">
	import ImageTag from '$lib/components/ImageTag.svelte';
	import { Image, ImageOff, Link, Subtitles } from 'lucide-svelte';
	import type { Entity, EntityByID, Tag } from '../../../../app';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Statblock from '$lib/components/new/EntityDisplay/Statblock.svelte';

	export let entity: Entity;
	let parsedEntity: Entity;
	$: parsedEntity = { ...entity, data: JSON.parse(entity.data || '{}') };

	// let entity: Entity;
</script>

<div class="flex flex-row justify-center items-center">
	{#if parsedEntity && entity.data != '{}'}
		<Statblock entity={parsedEntity}>
			<Button variant="ghost">
				<Subtitles />
			</Button>
		</Statblock>
	{/if}
</div>
