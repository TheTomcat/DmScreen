<script lang="ts">
	import type { ImageURL } from '../../../app';

	import ImageTag from '$lib/components/ImageTag.svelte';
	import { default as Dialog2 } from '$lib/components/Dialog.svelte';
	import ImageManager from '$lib/components/new/ImageManager.svelte';
	import { tick } from 'svelte';
	import { capitalise } from '$lib';
	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import { flip } from 'svelte/animate';
	import { quintInOut } from 'svelte/easing';
	import { Heart } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		favouriteStore,
		type Favourite,
		contains,
		addFavourite,
		removeFavourite
	} from '$lib/stores/favouriteStore';
	import { cn } from '$lib/utils';
	import { Description } from '$lib/components/ui/card';

	// let editImageDialog: Dialog2;
	let editImageDialogOpen: boolean = false;
	let editImage: ImageURL;

	let searchInput: HTMLInputElement;

	const handleClick = (image: ImageURL) => {
		editImage = image;
		console.log(editImage);
		tick().then(() => {
			// editImageDialog.open();
			editImageDialogOpen = true;
		});
	};
</script>

<div class="container">
	<ImageGallery>
		<div
			slot="gallery"
			let:galleryItems
			let:selectedTags
			class="grid gap-8 p-6 auto-rows-[200px_auto_auto] grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))]"
		>
			{#if galleryItems}
				{#each galleryItems as image (image.image_id)}
					{@const isFavourite = contains(image)}
					<button
						class="grid-rows-subgrid row-span-3 dark:bg-slate-900 rounded-md gap-4 overflow-hidden hover:scale-110 hover:transition-all transition-all"
						animate:flip={{ duration: 500, easing: quintInOut }}
						on:click={() => handleClick(image)}
					>
						<div class="overlaycontainer relative">
							<img
								class="portrait"
								src={`/api/${image.thumbnail_url}?width=240`}
								alt={image.name}
								width={image.dimension_x}
								height={image.dimension_y}
							/>
							<div
								class="absolute top-0 bottom-0 left-0 right-0 h-full w-full opacity-0 transition-all bg-gray-500 hover:opacity-40 flex flex-row items-start justify-end p-5"
							>
								{#key $favouriteStore}
									<Button
										class="p-0 m-0 h-[unset]"
										variant="ghost"
										on:click={(e) => {
											e.stopPropagation();
											if (isFavourite) {
												removeFavourite(image);
											} else {
												addFavourite(image);
											}
											image = image;
											// console.log(image);
										}}
									>
										<Heart
											class={cn('hover:stroke-red-600', {
												'fill-red-600': isFavourite
											})}
										/>
									</Button>
								{/key}
							</div>
						</div>

						<h3 class="heading">{image.name}</h3>
						<div class="information">
							<div class="tags flex flex-wrap">
								{#each image.tags as tag (tag.tag_id)}
									<ImageTag
										{tag}
										interactive={false}
										highlight={!!selectedTags.find((t) => t.tag_id == tag.tag_id)}
										small={true}
									/>
								{/each}
							</div>
							<div class="imid">
								{capitalise(image.type || 'undefined')}: {image.dimension_x}x{image.dimension_y} - {image.image_id}
							</div>
							<div class="palette">
								{#if image.palette}
									{#each image.palette.split(',') as colour}
										<span class="circle" style={`background-color: ${colour};`} />
									{/each}
								{/if}
							</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>
		<!-- <div slot="image" let:image let:tags class="grid grid-cols-subgrid col-span-3">
			
		</div> -->
	</ImageGallery>
</div>
<!-- <div class="container">
	<h1>Gallery</h1>
	<div class="">
		<div class="flex">
			<Autocomplete
				getData={getTags}
				{extractName}
				{extractId}
				allowCreation={false}
				on:submititem={selectedTag}
			/>
			<ImageTypeSelectBox
				class="h-auto"
				selected="backdrop"
				onSelectedChange={(e) => {
					console.log(e);
					if (!e) return;
					// @ts-ignore
					imageType = e.value;
				}}
			/>
		</div>

		<div class="flex flex-wrap h-10">
			{#each selectedTags as tag (tag.tag_id)}
				<ImageTag {tag} on:clickclose={() => removeTag(tag)} />
			{/each}
		</div>
	</div>
	<div class="gallery gap-8 p-6">
		{#if galleryItems}
			{#each galleryItems as image (image.image_id)}
				<div
					class="gallery-item dark:bg-slate-900 rounded-md gap-4 overflow-hidden"
					animate:flip={{ duration: 500, easing: quintInOut }}
				>
					
				</div>
			{/each}
		{/if}
	</div>
</div> -->

<Dialog.Root bind:open={editImageDialogOpen}>
	<Dialog.Content class="sm:max-w-[800px]">
		<Dialog.Header>
			<Dialog.Title>Edit Image</Dialog.Title>
			<Dialog.Description>Make changes to an image</Dialog.Description>
		</Dialog.Header>
		{#if editImage}
			<ImageManager image={editImage} bind:searchInput />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- 
<Dialog2 mode="mega" bind:this={editImageDialog} on:closed>
	<section slot="header">
		<h2>Edit Image</h2>
	</section>
	<svelte:fragment slot="content">
		{#if editImage}
			<ImageManager image={editImage} bind:searchInput />
		{/if}
	</svelte:fragment>
</Dialog2> -->

<style>
	.portrait::after {
		content: 'asdf';
	}
	.filter {
		padding: var(--size-3);
		margin: var(--size-3);
		border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8);
	}
	.gallery {
		display: grid;
		/* grid-auto-flow: dense; */
		/* gap: var(--size-5); */
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		/* padding: var(--size-3); */
		container-type: inline-size;
		grid-auto-rows: 200px auto auto;
		/* flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--size-5); */
	}
	.gallery-item {
		/* background-color: var(--surface-4);
		border-radius: var(--radius-3); */
		grid-row: span 3;
		grid-template-rows: subgrid;
		/* display: grid;
		gap: var(--size-3);
		overflow: hidden; */
		transition: all 0.2s ease-in-out;
	}
	.gallery-item:hover {
		transform: scale(1.1);
		transition: all 0.2s ease-in-out;
	}
	.gallery-item h3 {
		font-size: larger;
	}
	.gallery-item > :not(img) {
		margin-inline: 0.5rem;
	}
	.gallery-item > img {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		overflow: hidden;
		object-fit: cover; /*contain*/
		height: 200px;
	}
	.palette {
		display: flex;
	}
	.circle {
		position: relative;

		right: 0;
		border-radius: 50%;
		margin: 0.5rem;
		height: 1rem;
		width: 1rem;
		transform: scale(1);
		/* background: rgba(255, 177, 66, 1); */
		border: solid 1px rgb(230, 230, 230);
		box-shadow: var(--shadow-2);
	}
</style>
