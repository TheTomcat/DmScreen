<script lang="ts">
	import ImageTag from '$lib/components/ImageTag.svelte';
	import type { Tag } from '../../../../app';

	export let taglist: Tag[] = [];
</script>

<div class="flex flex-row justify-start items-center">
	{#each taglist as tag (tag.tag_id)}
		<ImageTag {tag} small={true} interactive={false} />
	{/each}
</div>
