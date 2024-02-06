<script lang="ts">
	import type { RollMode } from '../../app';

	import * as Select from '$lib/components/ui/select';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Selected } from 'bits-ui';
	// type T = $$Generic;
	type T = RollMode | 'Set';

	export let value: T; //{ value: T; label: string };
	export let placeholder: string = '';
	export let heading: string = '';
	// type $$Props = HTMLAttributes<HTMLDivElement>;

	// let className: $$Props['class'] = undefined;
	// export { className as class };

	onMount(() => {});

	const dispatch = createEventDispatcher<{ change: { value: T } }>();
	let selectedValue: { value: T; label: string } | undefined;
	$: {
		selectedValue = options.find((o) => o.value == value);
		// if (selectedValue) value = selectedValue.value;
	}

	const setValue = (e: Selected<T>) => {
		value = e.value;
	};

	const options: { value: T; label: string }[] = [
		{ value: 'one', label: '1' },
		{ value: 'min', label: 'Minimum' },
		{ value: 'random', label: 'Random' },
		{ value: 'default', label: 'Default (average)' },
		{ value: 'max', label: 'Maximum' },
		{ value: 'Set', label: 'Set Manually...' }
	];
</script>

<Select.Root
	portal={null}
	bind:selected={selectedValue}
	onSelectedChange={(e) => {
		if (!e) return;
		setValue(e);
		dispatch('change', { value: e.value });
		// rollAll(true, e.value);
	}}
>
	<Select.Trigger class="w-[180px]">
		<Select.Value {placeholder} />
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>{heading}</Select.Label>
			{#each options as roll}
				<Select.Item value={roll.value} label={roll.label}>{roll.label}</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<!-- <Select.Input bind:value={rollModePC} /> -->
</Select.Root>
