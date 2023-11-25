<script lang="ts">
	import type { _ImageMatch, Image, ImageURL, Tag } from '../../../app';

	import ImageGalleryElement from '$lib/components/new/ImageGalleryElement.svelte';
	import ImageTag from '$lib/components/ImageTag.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';

	import client from '$lib/api/index';
	import type { components } from '$lib/api/v1';
	import Dialog from '$lib/components/Dialog.svelte';
	import ImageManager from '$lib/components/new/ImageManager.svelte';
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { capitalise } from '$lib';
	import { flip } from 'svelte/animate';
	import { quintInOut } from 'svelte/easing';

	type ImageType = components['schemas']['ImageType'];

	let selectedTags: Tag[] = [];
	let galleryItems: ImageURL[];
	let editImageDialog: Dialog;
	let editImage: Image;
	let imageType: ImageType;

	const getTags = async (q: string) => {
		return await client.GET('/tag/', { params: { query: { tag: q } } }).then((res) => {
			if (!res.data) {
				console.error('No Data');
				return [];
			}
			if (res.error) {
				console.error('Bad Error:');
				return [];
			}
			return res.data.items;
		});
	};

	$: {
		if (browser) {
			imageType;
			loadImages();
		}
	}

	const loadImages = () => {
		if (selectedTags.length > 0) {
			client
				.GET('/image/tag', {
					params: { query: { taglist: selectedTags.map((t) => t.tag_id), type: imageType } }
				})
				.then((response) => {
					if (!response.data) return;
					galleryItems = response.data.items;
				});
		} else {
			client
				.GET('/image/', {
					params: { query: { type: imageType } }
				})
				.then((response) => {
					if (!response.data) return;
					galleryItems = response.data.items;
				});
		}
	};

	const extractName = (tag: Tag) => tag.tag;
	const extractId = (tag: Tag) => tag.tag_id;
	const selectedTag = (e: CustomEvent<Tag>) => {
		let tag: Tag = e.detail;
		if (selectedTags.find((t) => t.tag_id == tag.tag_id)) return;
		selectedTags = [...selectedTags, tag];
		loadImages();
	};
	const removeTag = (tag: Tag) => {
		selectedTags = selectedTags.filter((t) => t.tag_id !== tag.tag_id);
		loadImages();
	};
</script>

<div class="container">
	<h1>Gallery</h1>
	<div class="filter">
		<Autocomplete
			getData={getTags}
			{extractName}
			{extractId}
			allowCreation={false}
			on:submititem={selectedTag}
		/>
		<select bind:value={imageType}
			>Image Type
			<option value="backdrop">Backdrop</option>
			<option value="character">Character</option>
			<option value="map">Map</option>
			<option value="handout">Handout</option>
		</select>
		<div class="tags">
			{#each selectedTags as tag (tag.tag_id)}
				<ImageTag {tag} on:clickclose={() => removeTag(tag)} />
			{/each}
		</div>
	</div>
	<div class="gallery">
		{#if galleryItems}
			{#each galleryItems as image (image.image_id)}
				<div class="gallery-item" animate:flip={{ duration: 500, easing: quintInOut }}>
					<img
						class="portrait"
						src={`/api/${image.thumbnail_url}?width=240`}
						alt={image.name}
						width={image.dimension_x}
						height={image.dimension_y}
						on:click={() => {
							editImage = image;
							console.log(editImage);
							tick().then(() => {
								editImageDialog.open();
							});
						}}
					/>

					<h3 class="heading">{image.name}</h3>
					<div class="information">
						<div class="tags">
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
				</div>
			{/each}
		{/if}
	</div>
</div>
<Dialog mode="mega" bind:this={editImageDialog} on:closed>
	<section slot="header">
		<h2>Edit Image</h2>
	</section>
	<svelte:fragment slot="content">
		{#if editImage}
			<ImageManager image={editImage} />
		{/if}
	</svelte:fragment>
</Dialog>

<style>
	.filter {
		padding: var(--size-3);
		margin: var(--size-3);
		border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8);
	}
	.gallery {
		display: grid;
		/* grid-auto-flow: dense; */
		gap: var(--size-5);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		padding: var(--size-3);
		container-type: inline-size;
		grid-auto-rows: 200px auto auto;
		/* flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--size-5); */
	}
	.gallery-item {
		background-color: var(--surface-4);
		border-radius: var(--radius-3);
		grid-row: span 3;
		grid-template-rows: subgrid;
		display: grid;
		gap: var(--size-3);
		overflow: hidden;
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
		margin-inline: var(--size-2);
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
		margin: var(--size-1);
		height: var(--size-3);
		width: var(--size-3);
		transform: scale(1);
		/* background: rgba(255, 177, 66, 1); */
		border: solid 1px var(--text-2);
		box-shadow: var(--shadow-2);
	}
</style>
