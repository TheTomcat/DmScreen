<script lang="ts">
	import { imageTypes } from './data';
	export let value: string | undefined | null;
	const imType = imageTypes.find((imType) => imType.value === value);
	const Icon = imType?.icon;
</script>

{#if imType}
	<div class="flex items-center">
		{#if Icon}
			<Icon class="mr-2 h-4 w-4 text-muted-foreground" />
		{/if}
		<span>{imType.label}</span>
	</div>
{/if}
