<script lang="ts">
	import type { _ImageMatch, Tag } from '../../../app';
	// import type { _ImageMatch } from '../../../app';
	import { onMount } from 'svelte';

	import GalleryElement from '$lib/components/old/GalleryElement.svelte';
	import ImageTag from '$lib/components/ImageTag.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';

	import { apiGetImageTagMatch } from '$lib/api';

	export let data: { tags: Tag[] };

	let allTags: Tag[] = [];
	let selectedTags: Tag[] = [];
	let galleryItems: _ImageMatch[] = [];

	onMount(() => {
		allTags = data.tags;
	});

	const addTag = (tag: Tag) => {
		console.log(tag);
		if (selectedTags.includes(tag)) return;
		selectedTags = [...selectedTags, tag];
		console.log(selectedTags);
	};
	const removeTag = (tag: Tag) => {
		selectedTags = selectedTags.filter((_tag) => _tag.tag_id != tag.tag_id);
	};

	$: {
		if (selectedTags.length > 0) {
			apiGetImageTagMatch(
				fetch,
				selectedTags.map((tag) => tag.tag_id)
			).then(({ images }) => {
				galleryItems = images;
			});
		}
	}
</script>

<h1>Gallery</h1>
<form id="sbmt">
	<Autocomplete
		allItems={allTags}
		extractName={(tag) => tag.tag}
		extractId={(tag) => tag.tag_id}
		on:submititem={addTag}
		allowCreation={false}
	/>
</form>
<div class="tags">
	{#each selectedTags as tag (tag.tag_id)}
		<ImageTag {tag} onClick={() => removeTag(tag)} />
	{/each}
</div>
<div class="gallery">
	{#each galleryItems as galleryElement}
		<GalleryElement image_id={galleryElement.image_id} />
	{/each}
</div>

<style>
	.gallery {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--size-5);
	}
</style>
