<script lang="ts">
	// import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import Dropzone from '$lib/components/new/Dropzone.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import ImageTag from '$lib/components/ImageTag.svelte';
	import client from '$lib/api/index';
	// import {type Tag} from '$lib/index'

	type Tag = components['schemas']['Tag'];
	let selectedTags: Tag[] = [];

	import type { components } from '$lib/api/v1';
	import { ImagePlus, Tag, Trash2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ImageTypeSelectBox from '$lib/components/ImageTypeSelectBox.svelte';
	import type { ImageType } from '../../../../../app';

	let selectedType: ImageType | null | undefined = 'backdrop';
	// type FileList = {
	// 	accepted: File[];
	// 	rejected: File[];
	// };
	// let files: FileList = {
	// 	accepted: [],
	// 	rejected: []
	// };
	let uploadedImageElements: {
		src: string;
		name: string;
		url: string;
		id: number;
	}[] = [];

	// function handleRemoveFile(e: MouseEvent, index: number) {
	// 	files.accepted.splice(index, 1);
	// 	files.accepted = [...files.accepted];
	// }
	// function handleRemoveAll() {
	// 	files.accepted = [];
	// }

	const extractId = (t: Tag) => t.tag_id;
	const extractName = (t: Tag) => t.tag;

	const getData = (q: string) => {
		return client.GET('/tag/', { params: { query: { tag: q } } }).then((res) => {
			// console.log(res.data);
			if (!res.data) {
				console.error('No Data');
				return [];
			}
			if (res.error) {
				console.error('Bad Error:');
				return [];
			}
			return res.data.items;
			// callback(res.data.items);
		});
	};
	const addTag = (tag: Tag) => {
		if (selectedTags.find((t) => t.tag_id == tag.tag_id)) return;
		selectedTags = [...selectedTags, tag];
	};

	const removeTag = (tag: Tag) => {
		selectedTags = selectedTags.filter((t) => t.tag_id !== tag.tag_id);
	};

	async function handleUpload(file: File) {
		const formData = new FormData();
		formData.append('image_file', file);

		fetch('/api/image/upload', {
			method: 'POST',
			body: formData
		})
			.then((response) => response.json())
			.then((image) => {
				console.log(image);
				let i: HTMLImageElement = document.createElement('img');
				const reader = new FileReader();
				reader.onloadend = (e: ProgressEvent) => {
					let i = {
						// @ts-ignore
						src: e.target.result as string,
						name: image.name,
						url: `/manager?image=${image.image_id}`,
						id: image.image_id
					};
					uploadedImageElements = [...uploadedImageElements, i];
				};
				reader.readAsDataURL(file);
			});
	}
	const applyTags = () => {
		uploadedImageElements.forEach((i) => {
			client.PUT('/image/{image_id}/tag', {
				params: { path: { image_id: i.id } },
				body: selectedTags.map((t) => t.tag_id)
			});
		});
	};
</script>

At the moment, uploading multiple files is allowed but if you want to change the Tag Data for the
images, it has to be set prior to uploading.
<h2 class="text-lg py-2">Apply Tags</h2>
<div>
	<Autocomplete
		on:submititem={(e) => addTag(e.detail)}
		on:emptysubmit
		{getData}
		{extractId}
		{extractName}
		placeholder={'Enter a Tag...'}
		allowCreation={false}
	/>
</div>
<div class="flex flex-row justify-between items-center">
	<div class="flex flex-row justify-start gap-2 h-16">
		{#each selectedTags as tag (tag.tag_id)}
			<ImageTag {tag} on:clickclose={(e) => removeTag(tag)} />
		{/each}
	</div>
	<Button
		on:click={() => {
			selectedTags = [];
		}}><Trash2 class="w-4 h-4 mr-1" />Remove All Tags</Button
	>
</div>
Image Type: <ImageTypeSelectBox bind:selected={selectedType} onSelectedChange={() => {}} />

<Dropzone {handleUpload} />
<div class="flex gap-3 flex-wrap">
	{#each uploadedImageElements as i}
		<a href={i.url} class="w-60">
			<img src={i.src} alt={i.name} />
		</a>
	{/each}
</div>
<Button on:click={applyTags}><ImagePlus class="h-4 w-4 mr-1" />Apply Tags</Button>

<!-- <div style="margin: 5px;">
	{#if files.accepted.length > 0}
		<button on:click={handleRemoveAll}>RemoveAll</button>
	{/if}
	{#each files.accepted as item, index}
		<div>
			<span>{item.name}</span>
			<button on:click={(e) => handleRemoveFile(e, index)}>Remove</button>
		</div>
	{/each}
</div> -->

<style>

</style>
