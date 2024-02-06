<script lang="ts">
	import { Image, ImageOff } from 'lucide-svelte';
	import type { ImageURL } from '../../../../app';
	import * as Popover from '$lib/components/ui/popover';
	import Button from '$lib/components/ui/button/button.svelte';
	import PopoverContent from '$lib/components/ui/popover/popover-content.svelte';
	import client from '$lib/api/index';

	export let image_id: number | undefined | null;
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
				<Button on:click={getImage} builders={[builder]} variant="ghost">
					<Image />
				</Button>
			</Popover.Trigger>
			<PopoverContent>
				{#if image}
					<Button href="/manager?image={image_id}" variant="ghost" class="h-[unset]">
						<img
							class="portrait"
							src={`/api/${image.thumbnail_url}?width=200`}
							alt={image.name}
							width={image.dimension_x}
							height={image.dimension_y}
						/>
					</Button>
				{/if}
			</PopoverContent>
		</Popover.Root>
	{:else}
		<ImageOff />
	{/if}
</div>
