<script lang="ts">
	import type { _ImageMatch, Image, ImageURL, Tag } from '../../app';

	import ImageTag from '$lib/components/ImageTag.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';

	import client from '$lib/api/index';
	import type { components } from '$lib/api/v1';

	import { browser } from '$app/environment';
	import ImageTypeSelectBox from '$lib/components/ImageTypeSelectBox.svelte';

	export let small: boolean = false;
	export let defaultImageType: ImageType = 'backdrop';

	type ImageType = components['schemas']['ImageType'];

	let selectedTags: Tag[] = [];
	let galleryItems: ImageURL[];

	let imageType: ImageType = defaultImageType;

	const getTags = async (q: string) => {
		return await client.GET('/tag/', { params: { query: { tag: q } } }).then((res) => {
			if (res.error) {
				console.error(`Bad Error: ${res.error}`);
				return [];
			}
			if (!res.data) {
				console.error('No Data');
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
		selected={defaultImageType}
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
		<ImageTag {tag} {small} on:clickclose={() => removeTag(tag)} />
	{/each}
</div>
<slot name="gallery" {galleryItems} {selectedTags} />
