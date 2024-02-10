<script lang="ts">
	import ImageTag from '$lib/components/ImageTag.svelte';
	import { Image, ImageOff, Link, Subtitles } from 'lucide-svelte';
	import type { Entity, EntityByID, Tag } from '../../../../app';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Statblock from '$lib/components/new/EntityDisplay/Statblock.svelte';

	import type { ImageURL } from '../../../../app';
	import * as Popover from '$lib/components/ui/popover';
	import PopoverContent from '$lib/components/ui/popover/popover-content.svelte';
	import client from '$lib/api/index';

	export let entity: any;

	export let show_null: boolean = true;
	export let link_to_image: boolean = true;

	let parsedEntity: Entity;
	$: parsedEntity = { ...entity, data: JSON.parse(entity.data || '{}') };
	$: image_id = entity.image_id;

	let image: ImageURL | undefined;

	const getImage = () => {
		if (image_id)
			client.GET('/image/{image_id}', { params: { path: { image_id } } }).then((response) => {
				if (response) image = response.data;
			});
	};
	// let entity: Entity;
</script>

<div class="flex flex-row justify-center items-center gap-2">
	{#if parsedEntity && 'data' in entity && entity.data != '{}'}
		<Statblock entity={parsedEntity}>
			<Button variant="ghost" class="h-[unset] p-0 m-0">
				<Subtitles class="h-4 w-4" />
			</Button>
		</Statblock>
	{/if}
	{#if image_id}
		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button on:click={getImage} builders={[builder]} variant="ghost" class="h-[unset] p-0 m-0">
					<Image class="h-4 w-4" />
				</Button>
			</Popover.Trigger>
			<PopoverContent>
				{#if image && link_to_image}
					<Button href="/manager?image={image_id}" variant="ghost">
						<img
							class="portrait"
							src={`/api/${image.thumbnail_url}?width=200`}
							alt={image.name}
							width={image.dimension_x}
							height={image.dimension_y}
						/>
					</Button>
				{:else if image && !link_to_image}
					<img
						class="portrait"
						src={`/api/${image.thumbnail_url}?width=200`}
						alt={image.name}
						width={image.dimension_x}
						height={image.dimension_y}
					/>
				{/if}
			</PopoverContent>
		</Popover.Root>
	{:else if show_null}
		<ImageOff class="h-4 w-4" />
	{/if}
</div>
