<script lang="ts">
	import type { _ImageMatch, Image, Tag } from '../../../app';
	import { onMount } from 'svelte';

	import ImageTag from '../../../components/ImageTag.svelte';
	import Autocomplete from '../../../components/Autocomplete.svelte';

	import {
		apiApplyTagIdToImage,
		apiCreateNewTag,
		apiGetImageById,
		apiGetTagsOfImage,
		apiRemoveTagIdFromImage
	} from '$lib/api';

	export let data: { tags: Tag[] };

	let allTags: Tag[] = [];
	let selectedTags: Tag[] = [];

	let image_id = 1;
	let impromise: Promise<Image>;

	$: if (document) {
		impromise = apiGetImageById(fetch, image_id);
		apiGetTagsOfImage(fetch, image_id).then((response) => (selectedTags = response));
	}

	// const updateImage = () => {
	// 	apiGetImageById(fetch, image_id).then((response) => (image = response));
	// };

	onMount(() => {
		allTags = data.tags;
		// updateImage();
	});

	const createNewTag = (tagName: string) => {
		return apiCreateNewTag(fetch, { tag: tagName }).then((tag) => {
			allTags = [...allTags, tag];
			return tag;
		});
	};

	const handleTagSubmit = (tag: Tag | string) => {
		if (tag === '') {
			console.log('empty string', image_id);
			image_id += 1;
			return;
		}
		if (typeof tag == 'string') {
			createNewTag(tag).then((tag) => {
				tagImage(tag);
			});
			return;
		}
		tagImage(tag);
	};

	const tagImage = (tag: Tag) => {
		apiApplyTagIdToImage(fetch, image_id, tag.tag_id).then((image) => {
			selectedTags = [...selectedTags, tag];
		});
	};

	const addTag = (tag: Tag | string) => {
		if (typeof tag == 'string') {
			apiCreateNewTag(fetch, { tag }).then((tag) => {
				selectedTags = [...selectedTags, tag];
				allTags = [...allTags, tag];
			});
			return;
		} else {
			if (selectedTags.includes(tag)) return;
			selectedTags = [...selectedTags, tag];
			console.log(selectedTags);
		}
	};
	const removeTag = (tag: Tag) => {
		selectedTags = selectedTags.filter((_tag) => _tag.tag_id != tag.tag_id);
		apiRemoveTagIdFromImage(fetch, image_id, tag.tag_id);
	};
</script>

<dialog open>
	<h1>Tag Manager</h1>
	{#await impromise then image}
		<img src={`${image.thumbnail}?width=500`} alt={image.filename} />
	{/await}
	<Autocomplete
		allItems={allTags}
		getValue={(tag) => tag.tag}
		getID={(tag) => tag.tag_id}
		placeholder={'Enter a Tag'}
		onSubmitCallback={handleTagSubmit}
		allowCreation={true}
	/>
	<div class="tags">
		{#each selectedTags as tag (tag.tag_id)}
			<ImageTag {tag} onClick={() => removeTag(tag)} />
		{/each}
	</div>
</dialog>
