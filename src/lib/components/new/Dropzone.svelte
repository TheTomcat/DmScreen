<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import client from '$lib/api/index';
	// import { db, storage } from '$lib/firebaseConfig';
	import { cn } from '$lib/utils';
	import type { Progress } from 'bits-ui';

	// import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
	// import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
	// import toast from 'svelte-french-toast';
	import { toast } from 'svelte-sonner';

	export let handleUpload: (f: File) => Promise<void>;

	let isDragging = false;
	let allFiles: File[] = [];
	// type UploadedImage = { src: string; name: string; url: string; id: number }
	// export let uploadedImageElements: UploadedImage[] = [];
	let fileInput: HTMLInputElement;
	//     const ONE_KB = 1024;
	// const ONE_MB = ONE_KB * 1024;
	// let maxSizeInMegabytes = 10;
	// let maxSizeInBytes = maxSizeInMegabytes * ONE_MB;
	const maxSize = 10 * 1024 * 1024;
	// let uid = $page.data.user.uid;
	function handleDragEnter() {
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		isDragging = false;
		if (event.dataTransfer?.files) {
			const droppedFiles = Array.from(event.dataTransfer?.files);
			checkFileSizeAndUpload(droppedFiles);
		}
	}

	function handleClick(event: MouseEvent) {
		fileInput.click();
	}

	const handleFileSelect = () => {
		// Handle the selected files here
		if (fileInput.files) {
			const selectedFiles = Array.from(fileInput.files);
			checkFileSizeAndUpload(selectedFiles);
			// allFiles = [...files];
		}
	};

	const isFileValid = (file: File): boolean => {
		return file.type.startsWith('image/') && file.size <= maxSize;
	};

	async function checkFileSizeAndUpload(files: File[]) {
		allFiles = [...files];

		const allFilesValid = files.every((file) => {
			if (!isFileValid(file)) {
				//file.size > maxSize) {
				alert(`Error: ${file.name} file size exceeds 10MB`);
				return false;
			}

			return true;
		});
		console.log('all files valid');

		if (allFilesValid) {
			await toast.promise(Promise.all(files.map(handleUpload)), {
				loading: 'uploading...',
				success: 'uploaded successfully',
				error: 'Could not upload.'
			});
			await invalidateAll();
		}
	}

	// async function handleUpload(file: File) {
	// 	const formData = new FormData();
	// 	formData.append('image_file', file);

	// 	fetch('/api/image/upload', {
	// 		method: 'POST',
	// 		body: formData
	// 	})
	// 		.then((response) => response.json())
	// 		.then((image) => {
	// 			console.log(image);
	// 			let i: HTMLImageElement = document.createElement('img');
	// 			const reader = new FileReader();
	// 			reader.onloadend = (e: ProgressEvent) => {
	// 				let i = {
	// 					// @ts-ignore
	// 					src: e.target.result as string,
	// 					name: image.name,
	// 					url: `/manager?image=${image.id}`
	// 				};
	// 				uploadedImageElements = [...uploadedImageElements, i];
	// 			};
	// 			reader.readAsDataURL(file);
	// 		});

	// 	// return client.POST('/image/upload', {
	// 	// 	body: {
	// 	// 		image_file: await file.text()
	// 	// 	}
	// 	// });
	// 	// }

	// 	// client.POST('/image/upload', { body: { image_file: file.stream() } });
	// 	// const docRef = await addDoc(collection(db, 'files'), {
	// 	// 	uid,
	// 	// 	fileName: file.name,
	// 	// 	size: file.size,
	// 	// 	type: file.type,
	// 	// 	timestamp: serverTimestamp()
	// 	// });
	// 	// const fileRef = ref(storage, `user/${uid}/files/${docRef.id}`);
	// 	// await uploadBytes(fileRef, file);
	// 	// const downloadUrl = await getDownloadURL(fileRef);
	// 	// await updateDoc(docRef, {
	// 	// 	downloadUrl
	// 	// });
	// }
</script>

<button
	class={cn('w-full rounded-lg bg-border/50 h-44 border-4 border-dashed', {
		'bg-primary/50 border-primary': isDragging
	})}
	on:dragenter|preventDefault={handleDragEnter}
	on:dragleave|preventDefault={handleDragLeave}
	on:dragover|preventDefault
	on:drop|preventDefault={handleDrop}
	on:click={handleClick}
>
	{#if isDragging}
		Drop the file here
	{:else}
		Drag and drop a file here or click to add files
	{/if}

	<input bind:this={fileInput} on:change={handleFileSelect} type="file" multiple hidden />
</button>

<!-- {#each allFiles as file}
	{file.name} - {file.type} - {file.size}
{/each} -->
