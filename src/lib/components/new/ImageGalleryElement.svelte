<script lang="ts">
	import type { components } from '$lib/api/v1';
	import { capitalise } from '$lib';
	import { createEventDispatcher } from 'svelte';

	import ImageTag from '$lib/components/ImageTag.svelte';
	import { Button } from '$lib/components/ui/button';

	type Image = components['schemas']['ImageURL'];
	type Tag = components['schemas']['Tag'];

	export let image: Image | undefined;
	export let selectedTags: Tag[];
	// export let clickAction = (e: Image | null) => {};

	const dispatch = createEventDispatcher<{ image_click: { image: Image } }>();
	// let state: 'loading' | 'error' | 'done' = 'done';
</script>

{#if image}
	<div class="gallery-item">
		<!-- <Button -->
		<img
			class="portrait"
			src={`/api/${image.thumbnail_url}?width=240`}
			alt={image.name}
			width={image.dimension_x}
			height={image.dimension_y}
			on:click={() => {
				if (!image) return;
				dispatch('image_click', { image });
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
	.palette {
		display: flex;
	}
	.gallery-item {
		/* max-width: 800px; */
		margin: auto;
		padding: var(--size-3);
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-areas:
			'title title'
			'image details';
	}
	.heading {
		padding-block: var(--size-3);
		grid-area: title;
		/* display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: baseline; */
	}
	.image {
		grid-area: image;
	}
	.information {
		grid-area: details;
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
		height: 50%;
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
