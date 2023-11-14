<script lang="ts">
	import client from '$lib/api/index';
	import type { components } from '$lib/api/v1';
	import { capitalise } from '$lib';

	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import ImageTag from '$lib/components/ImageTag.svelte';

	type Image = components['schemas']['ImageURL'];
	type Tag = components['schemas']['Tag'];
	type ImageType = components['schemas']['ImageType'];
	const imageTypes = ['backdrop', 'character', 'handout', 'map'] as const;

	export let image: Image | null;
	let state: 'loading' | 'error' | 'done' = 'done';
	export let searchInput: HTMLInputElement;

	const extractId = (t: Tag) => t.tag_id;
	const extractName = (t: Tag) => t.tag;

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

	/////////////////////API INTERACTION////////////////////////////////
	const addTagTag = (tag: Tag) => {
		if (!image) return;
		client
			.PATCH('/image/{image_id}/tag', {
				params: { query: { tag_id: tag.tag_id }, path: { image_id: image.image_id } }
			})
			.then((res) => {
				if (res.data && image && image.tags) {
					image.tags = [...image?.tags, tag];
				}
			});
	};
	const addNewTag = (tagname: string) => {
		client.POST('/tag/', { body: { tag: tagname } }).then((tag) => {
			if (tag.data) {
				addTagTag(tag.data);
			}
		});
	};
	const removeTag = (tag: Tag) => {
		if (!image) return;
		client
			.DELETE('/image/{image_id}/tag', {
				params: { query: { tag_id: tag.tag_id }, path: { image_id: image.image_id } }
			})
			.then((res) => {
				if (res.data && image) {
					image.tags = image?.tags.filter((t) => t.tag_id !== tag.tag_id);
				}
			});
	};
	const setType = (type: ImageType) => {
		if (!image) return;
		client.PATCH('/image/{image_id}', {
			params: { path: { image_id: image.image_id } },
			body: { type }
		});
	};
	const setName = (name: string) => {
		if (!image) return;
		client.PATCH('/image/{image_id}', {
			params: { path: { image_id: image.image_id } },
			body: { name }
		});
	};
	///////////////////HANDLERS/////////////////////
	const handleChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		setType(target.value as ImageType);
	};
</script>

{#if image}
	<div class="controls">
		<div class="heading">
			<h3>{image.name}</h3>
			{#if image.palette}
				{#each image.palette.split(',') as colour}
					<span class="circle" style={`background-color: ${colour};`} />
				{/each}
			{/if}
			<div class="imid">{image.dimension_x}x{image.dimension_y} - {image.image_id}</div>
		</div>
		<div class="body" class:loading={state === 'loading'}>
			{#if state === 'loading'}
				<div class="loading" />
			{:else if state === 'done'}
				<img
					class="portrait"
					src={`/api/${image.thumbnail_url}?width=1000`}
					alt={image.name}
					width={image.dimension_x}
					height={image.dimension_y}
				/>
			{/if}
		</div>
		<input
			class="name"
			placeholder="Image Name"
			data-form-type="other"
			bind:value={image.name}
			on:change={(e) => {
				setName(e.currentTarget.value);
			}}
		/>
		<select class="type" value={image.type} on:change={handleChange}>
			{#each imageTypes as type}
				<option value={type}>{capitalise(type)}</option>
			{/each}
		</select>
		<div class="tagfield">
			<Autocomplete
				bind:searchInput
				on:submititem={(e) => addTagTag(e.detail)}
				on:submitnew={(e) => addNewTag(e.detail.value)}
				on:emptysubmit
				{getData}
				{extractId}
				{extractName}
				placeholder={'Enter a Tag...'}
				allowCreation={true}
			/>
		</div>
		<div class="tags">
			{#each image.tags as tag (tag.tag_id)}
				<ImageTag {tag} on:clickclose={() => removeTag(tag)} />
			{/each}
		</div>
	</div>
{/if}

<style>
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
	.container {
		max-width: 800px;
		margin: auto;
		padding: var(--size-3);
	}
	.heading {
		padding-block: var(--size-3);
		grid-area: title;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: baseline;
	}
	.imid {
		padding-block: var(--size-3);
		grid-area: imid;
		text-align: right;
		color: var(--text-2);
		/* font-size: small; */
	}
	.body {
		object-fit: contain;
		grid-area: image;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.body img {
		object-fit: contain;
		margin: auto;
		/* mix-blend-mode: multiply; */
		/* background-color: white; */

		overflow: hidden;
		height: 100%;
		border: 1px solid var(--gray-6);
		box-shadow: var(--shadow-5);
	}
	.loading {
		background: linear-gradient(70deg, #222, #444);
		background-size: 400% 400%;
		animation: gradient 3s ease infinite;
		border-radius: var(--radius-3);
	}
	.controls {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: auto 500px auto auto auto auto;
		grid-template-areas:
			'title title title title'
			'image image image image'
			'name name name type'
			'tagfield tagfield tagfield tagfield'
			'tags tags tags tags';
		column-gap: var(--size-3);
	}
	.controls * {
		/* padding-block: var(--size-3); */
		margin-block: var(--size-2);
	}
	.name {
		grid-area: name;
		padding: var(--size-3);
		background-color: var(--surface-4);
	}
	.type {
		grid-area: type;
		background-color: var(--surface-4);
	}
	.tagfield {
		grid-area: tagfield;
	}
	.tags {
		grid-area: tags;
	}
	.nav {
		grid-area: nav;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.nav button {
		width: var(--size-12);
		background-color: var(--surface-4);
		padding: var(--size-3);
	}
	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
