<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	import { capitalise } from '$lib';
	import { cn } from '$lib/utils';

	export let selected: string | null | undefined;
	export let onSelectedChange: (e: any) => void;
	type ImageType = {
		value: string;
		label: string;
	};
	const imageTypes: ImageType[] = ['backdrop', 'character', 'map', 'handout'].map((e) => {
		return { value: e, label: capitalise(e) };
	});
	let current: ImageType;

	let className: string | undefined = undefined;
	export { className as class };
	$: {
		current = imageTypes.find((t) => t.value == selected) || imageTypes[0];
	}
</script>

<Select.Root portal={null} items={imageTypes} {onSelectedChange} bind:selected={current}>
	<Select.Trigger class={cn('w-[180px]', className)}>
		<Select.Value placeholder="Select a type" />
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>Image Type</Select.Label>
			{#each imageTypes as type}
				<Select.Item value={type.value} label={type.label}>
					{type.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<Select.Input name="imageType" bind:value={selected} />
</Select.Root>
