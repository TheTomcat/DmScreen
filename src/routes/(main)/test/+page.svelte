<script lang="ts">
	import * as zs from '$lib/zodschema';

	//let val = zs.creaturesSchema.safeParse(zs.creatures);
	let value: string = '{}';
	let output: ReturnType<typeof zs.creatureSchema.safeParse>;

	$: {
		output = zs.creatureSchema.safeParse(value);
	}
</script>

<div class="flex flex-col">
	<span>
		{output.success}
	</span>
	<textarea bind:value />
	<div>
		{#if output.error}
			{#each output.error['issues'] as issue}
				{JSON.stringify(issue)}
			{/each}
		{/if}
	</div>
</div>
