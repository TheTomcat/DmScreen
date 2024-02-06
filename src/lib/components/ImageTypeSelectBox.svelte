<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { ImageType } from '../../app';

	import { capitalise } from '$lib';
	import { cn } from '$lib/utils';

	type ImageTypeA = {
		value: ImageType;
		label: string;
	};
	const imageTypes: ImageTypeA[] = ['backdrop', 'character', 'map', 'handout'].map((e) => {
		return { value: e as ImageType, label: capitalise(e) };
	});

	export let selected: ImageType | undefined | null;
	export let onSelectedChange: (e: any) => void;
	let current: ImageTypeA;

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
