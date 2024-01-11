<script lang="ts">
	import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import client from '$lib/api/index';
	let uploadDiv: HTMLInputElement;

	let files = {
		accepted: [],
		rejected: []
	};

	function handleFilesSelect(e) {
		console.log(e.detail.acceptedFiles);
		client.POST('/image/upload', { body: { image_file: d } });
		const { acceptedFiles, fileRejections } = e.detail;
		files.accepted = [...files.accepted, ...acceptedFiles];
		files.rejected = [...files.rejected, ...fileRejections];
	}

	function handleRemoveFile(e, index: number) {
		files.accepted.splice(index, 1);
		files.accepted = [...files.accepted];
	}
	function handleRemoveAll() {
		files.accepted = [];
	}
</script>

<Dropzone
	on:drop={handleFilesSelect}
	accept={['image/*']}
	containerClasses="custom-dropzone"
	inputElement={uploadDiv}
>
	<button>Choose images to upload</button>

	<p>or</p>
	<p>Drag and drop them here</p>
</Dropzone>

<div style="margin: 5px;">
	{#if files.accepted.length > 0}
		<button on:click={handleRemoveAll}>RemoveAll</button>
	{/if}
	{#each files.accepted as item, index}
		<div>
			<span>{item.name}</span>
			<button on:click={(e) => handleRemoveFile(e, index)}>Remove</button>
		</div>
	{/each}
</div>

<style>
	:global(.custom-dropzone) {
	}
</style>
