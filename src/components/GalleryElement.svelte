<script lang="ts">
	export let image_id: number | string;
</script>

<article class="gallery-element">
	<img src="/api/image/{image_id}/thumb" alt="" />
	<div class="overlay">
		<a class="smallbutton secondary" href="/backdrop?image={image_id}" role="button">Backdrop</a>
		<a class="smallbutton secondary" href="/loading?image={image_id}" role="button">Loading</a>
		<a class="smallbutton secondary" href="/manager/{image_id}" role="button">Manage Tags</a>`
	</div>
</article>
