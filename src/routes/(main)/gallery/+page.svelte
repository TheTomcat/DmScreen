<script lang="ts">
	import type { _ImageMatch, Tag } from '../../../app';
	// import type { _ImageMatch } from '../../../app';
	import { onMount } from 'svelte';

	import GalleryElement from '$lib/components/old/GalleryElement.svelte';
	import ImageGalleryElement from '$lib/components/new/ImageGalleryElement.svelte';
	import ImageTag from '$lib/components/ImageTag.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';

	import { apiGetImageTagMatch } from '$lib/api';
	import client from '$lib/api/index';
	import type { components } from '$lib/api/v1';

	// export let data: { tags: Tag[] };

	type ImageMatchResult = components['schemas']['ImageMatchResult'];

	let allTags: Tag[] = [];
	let selectedTags: Tag[] = [];
	let galleryItems: ImageMatchResult; //_ImageMatch[] = [];

	const getData = (q: string, callback: Function) => {
		client.GET('/tag/', { params: { query: { tag: q } } }).then((res) => {
			// console.log(res.data);
			if (!res.data) {
				console.error('No Data');
				return [];
			}
			if (res.error) {
				console.error('Bad Error:');
				return [];
			}
			callback(res.data.items);
		});
	};

	const loadImages = () => {
		client
			.GET('/image/tag', { params: { query: { taglist: selectedTags.map((t) => t.tag_id) } } })
			.then((response) => {
				if (!response.data) return;
				galleryItems = response.data;
			});
	};

	const extractName = (tag: Tag) => tag.tag;
	const extractId = (tag: Tag) => tag.tag_id;
	const selectedTag = (e: CustomEvent<Tag>) => {
		let tag: Tag = e.detail;
		if (selectedTags.find((t) => t.tag_id == tag.tag_id)) return;
		selectedTags = [...selectedTags, tag];
		loadImages();
	};
</script>

<div class="container">
	<h1>Gallery</h1>
	<div class="filter">
		<Autocomplete
			{getData}
			{extractName}
			{extractId}
			allowCreation={false}
			on:submititem={selectedTag}
		/>
		<select>Image Type</select>
		<div class="tags">
			{#each selectedTags as tag (tag.tag_id)}
				<ImageTag {tag} />
			{/each}
		</div>
	</div>
	<div class="gallery">
		{#if galleryItems}
			{#each galleryItems.matches as galleryElement}
				<ImageGalleryElement image={galleryElement.image} />
			{/each}
		{/if}
	</div>
</div>

<style>
	.filter {
		padding: var(--size-3);
		margin: var(--size-3);
		border-radius: var(--radius-3);
		border: var(--border-size-2) solid var(--gray-8);
	}
	.gallery {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--size-5);
	}
</style>
