<script lang="ts">
	import { flip } from 'svelte/animate';
	import { quintInOut } from 'svelte/easing';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';

	import { skills as allSkills } from '$lib/jsonschema';
	type Skill = (typeof allSkills)[number];

	import { PlusCircle, Trash2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { capitalise, renderModifier } from '$lib';

	export let skills: { [skl in Skill]?: string } | undefined;

	let blankRow: boolean = true;
	let newSelection: { value: Skill; label: string; disabled: boolean } | undefined;
	let newValue: string | undefined;

	const removeSkill = (name: string) => {
		return () => {
			if (skills) {
				delete skills[name as Skill];
				skills = skills;
			}
		};
	};

	const onBlur = () => {
		if (newSelection && newValue && parseInt(newValue)) {
			skills = { ...skills, [newSelection.value]: newValue };
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

{#if skills}
	<div class="grid grid-cols-3 gap-1 w-[500px]">
		<h2 class="col-span-3 text-lg">Skills</h2>
		{#each [...Object.entries(skills), ['blank', '0']] as [key, val] (key)}
			<div
				class="grid grid-cols-subgrid col-span-3"
				animate:flip={{ duration: 250, easing: quintInOut }}
			>
				{#if key != 'blank'}
					<div>{capitalise(key)}</div>
					<div>{val}</div>
					<Button on:click={removeSkill(key)}><Trash2 class="h-4 w-4" /></Button>
				{:else if blankRow}
					<div>
						<Select.Root portal={null} bind:selected={newSelection} onSelectedChange={onBlur}>
							<Select.Trigger class="w-[150px]">
								<Select.Value placeholder="Select a skill" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Label>Skills</Select.Label>
									{#each allSkills as skill (skill)}
										{#if !(skill in skills)}
											<Select.Item value={skill} label={capitalise(skill)}>
												{capitalise(skill)}
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
