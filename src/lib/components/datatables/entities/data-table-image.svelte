<script lang="ts">
	import { Image, ImageOff } from 'lucide-svelte';
	import type { ImageURL } from '../../../../app';
	import * as Popover from '$lib/components/ui/popover';
	import Button from '$lib/components/ui/button/button.svelte';
	import PopoverContent from '$lib/components/ui/popover/popover-content.svelte';
	import client from '$lib/api/index';

	export let image_id: number | undefined | null;

	export let show_null_image: boolean = true;
	export let link_to_image: boolean = true;

	let image: ImageURL | undefined;

	const getImage = () => {
		if (image_id)
			client.GET('/image/{image_id}', { params: { path: { image_id } } }).then((response) => {
				if (response) image = response.data;
			});
	};
</script>

<div class="flex flex-row justify-center items-center">
	{#if image_id}
		<Popover.Root>
			<Popover.Trigger asChild let:builder>
				<Button on:click={getImage} builders={[builder]} variant="ghost" class="h-[unset] py-0">
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
	{:else if show_null_image}
		<ImageOff class="h-4 w-4" />
	{/if}
</div>
