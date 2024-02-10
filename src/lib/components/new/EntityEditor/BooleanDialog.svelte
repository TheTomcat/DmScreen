<script lang="ts">
	import { flip } from 'svelte/animate';
	import { quintInOut } from 'svelte/easing';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';

	import { damageTypes } from '$lib/jsonschema';
	type DamageTypes = (typeof damageTypes)[number];

	import { PlusCircle, Trash2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { capitalise, renderModifier } from '$lib';

	export let selection: { [dt in DamageTypes]?: string } | undefined;
	export let options: string[];

	let blankRow: boolean = true;
	let newSelection: { value: DamageTypes; label: string; disabled: boolean } | undefined;
	let newValue: string | undefined;

	const removeSelection = (name: string) => {
		return () => {
			if (selection) {
				delete selection[name as DamageTypes];
				selection = selection;
			}
		};
	};

	const onBlur = () => {
		if (newSelection && newValue && parseInt(newValue)) {
			selection = { ...selection, [newSelection.value]: newValue };
			newValue = undefined;
			newSelection = undefined;
			blankRow = false;
		}
	};

	const onInputChange = () => {
		newValue = renderModifier(parseInt(newValue || '0'));
		onBlur();
	};
</script>

{#if selection}
	<div class="grid grid-cols-3 gap-1 w-[500px]">
		<h2 class="col-span-3 text-lg">Damage Resistances</h2>
		{#each [...Object.entries(selection), ['blank', '0']] as [key, val] (key)}
			<div
				class="grid grid-cols-subgrid col-span-3"
				animate:flip={{ duration: 250, easing: quintInOut }}
			>
				{#if key != 'blank'}
					<div>{capitalise(key)}</div>
					<div>{val}</div>
					<Button on:click={removeSelection(key)}><Trash2 class="h-4 w-4" /></Button>
				{:else if blankRow}
					<div>
						<Select.Root portal={null} bind:selected={newSelection} onSelectedChange={onBlur}>
							<Select.Trigger class="w-[150px]">
								<Select.Value placeholder="Select a skill" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Label>Skills</Select.Label>
									{#each damageTypes as damageType (damageType)}
										{#if !(damageType in selection)}
											<Select.Item value={damageType} label={capitalise(damageType)}>
												{capitalise(damageType)}
											</Select.Item>
										{/if}
									{/each}
								</Select.Group>
							</Select.Content>
							<Select.Input />
						</Select.Root>
					</div>
					<Input bind:value={newValue} on:blur={onInputChange} />
					<Button
						on:click={() => {
							blankRow = false;
						}}><Trash2 class="h-4 w-4" /></Button
					>
				{:else}
					<div class="col-span-3 text-lg flex justify-end">
						<Button
							on:click={() => {
								blankRow = true;
							}}
						>
							<PlusCircle class="h-4 w-4 mr-1" />Add Row
						</Button>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
