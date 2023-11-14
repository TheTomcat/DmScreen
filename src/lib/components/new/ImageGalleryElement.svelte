<script lang="ts">
	import type { components } from '$lib/api/v1';
	import { capitalise } from '$lib';

	import ImageTag from '$lib/components/ImageTag.svelte';

	type Image = components['schemas']['ImageURL'];

	export let image: Image | null;
	let state: 'loading' | 'error' | 'done' = 'done';
</script>

{#if image}
	<div class="container">
		<div class="image">
			{#if state === 'loading'}
				<div class="loading" />
			{:else if state === 'done'}
				<img
					class="portrait"
					src={`/api/${image.thumbnail_url}?width=500`}
					alt={image.name}
					width={image.dimension_x}
					height={image.dimension_y}
				/>
			{/if}
		</div>
		<div class="information">
			<h3>{image.name}</h3>
			{capitalise(image.type || 'undefined')}

			<div class="tags">
				{#each image.tags as tag (tag.tag_id)}
					<ImageTag {tag} interactive={false} />
				{/each}
			</div>
			<div class="imid">{image.dimension_x}x{image.dimension_y} - {image.image_id}</div>
			<div class="palette">
				{#if image.palette}
					{#each image.palette.split(',') as colour}
						<span class="circle" style={`background-color: ${colour};`} />
					{/each}
				{/if}
			</div>
		</div>
	</div>
	<!-- <div class="body" class:loading={state === 'loading'}> -->
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
</style>
