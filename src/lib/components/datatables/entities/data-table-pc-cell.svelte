<script lang="ts">
	import { pcTypes } from './data';
	export let value: string;
	const pcType = pcTypes.find((pcType) => pcType.value === value);
	const Icon = pcType?.icon;
</script>

{#if pcType}
	<div class="flex items-center">
		{#if Icon}
			<Icon class="mr-2 h-4 w-4 text-muted-foreground" />
		{/if}
		<span>{pcType.label}</span>
	</div>
{/if}
