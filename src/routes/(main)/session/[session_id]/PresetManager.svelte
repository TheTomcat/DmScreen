<script lang="ts">
	import { Trash2 } from 'lucide-svelte';
	import {
		playerStateStore,
		wsController,
		getPresets,
		loadPresetFromObject,
		savePreset,
		type Preset,
		type playerState,
		deletePreset
	} from '$lib/ws';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { onMount } from 'svelte';

	export let ws: wsController;

	let presetName: string = '';
	let presets: Preset[] = [];

	type SelectStateElement = keyof playerState;
	type SelectState = {
		[p in SelectStateElement]: boolean;
	};

	const setStateFalse = () => {
		return {
			combat: false,
			mode: false,
			combat_display: false,
			background_image_id: false,
			background_image_data: false,
			background_image_timeout: false,
			background_image_display: false,
			background_image_cycle: false,
			spinner_display: false,
			message_id: false,
			message_timeout: false,
			message_display: false,
			message_cycle: false,
			announce_text: false,
			announce_timeout: false,
			announce_display: false,
			handout_display: false,
			handout_image_id: false,
			map_display: false,
			map_image_id: false,
			map_data: false
		};
	};

	let savePresetElements: SelectState = setStateFalse();

	const buildPreset = (states: SelectState): Partial<playerState> => {
		let preset: Partial<playerState> = { ...$playerStateStore };
		return Object.entries(states)
			.filter(([key, value]) => value)
			.reduce((newObj, [key, value]) => {
				//@ts-ignore
				newObj[key] = preset[key];
				return newObj;
			}, {});
	};

	onMount(() => {
		presets = getPresets();
	});
</script>

<div class="flex gap-2" />
<div class="flex justify-center">
	<div class="grid grid-cols-[auto_auto_1fr] rounded border p-2 m-2 items-center w-1/2">
		<div class="col-span-3 flex justify-center">Preset</div>
		<Input
			class="col-span-3 flex justify-center"
			placeholder="Preset Name"
			bind:value={presetName}
			on:keydown={(e) => {}}
		/>
		<div />
		<div class="px-2">Value</div>
		<div>Field</div>
		<hr class="col-span-3 my-2" />
		<Checkbox bind:checked={savePresetElements.background_image_display} class="mx-2" />
		<div class="px-2">
			{$playerStateStore.background_image_display ? 'Visible' : 'Hidden'}
		</div>
		<div>Background Image Visibility</div>

		<Checkbox bind:checked={savePresetElements.background_image_data} class="mx-2" />
		<div class="px-2">{$playerStateStore.background_image_data || 'undefined'}</div>
		<div>Background Image Data</div>

		<hr class="col-span-3 my-2" />
		<Checkbox bind:checked={savePresetElements.handout_display} class="mx-2" />
		<div class="px-2">{$playerStateStore.handout_display ? 'Visible' : 'Hidden'}</div>
		<div>Handout Image Visibility</div>

		<Checkbox bind:checked={savePresetElements.handout_image_id} class="mx-2" />
		<div class="px-2">{$playerStateStore.handout_image_id || 'undefined'}</div>
		<div>Handout Image Data</div>

		<hr class="col-span-3 my-2" />
		<Checkbox bind:checked={savePresetElements.map_display} class="mx-2" />
		<div class="px-2">{$playerStateStore.map_display ? 'Visible' : 'Hidden'}</div>
		<div>Map Image Visibility</div>

		<Checkbox bind:checked={savePresetElements.map_data} class="mx-2" />
		<div class="px-2">{$playerStateStore.map_data || 'undefined'}</div>
		<div>Map Image Positioning</div>

		<Checkbox bind:checked={savePresetElements.map_image_id} class="mx-2" />
		<div class="px-2">{$playerStateStore.map_image_id || 'undefined'}</div>
		<div>Map Image Data</div>

		<hr class="col-span-3 my-2" />
		<Checkbox bind:checked={savePresetElements.message_display} class="mx-2" />
		<div class="px-2">{$playerStateStore.message_display ? 'Visible' : 'Hidden'}</div>
		<div>Message Visibility</div>

		<Checkbox bind:checked={savePresetElements.message_id} class="mx-2" />
		<div class="px-2">{$playerStateStore.message_id || 'undefined'}</div>
		<div>Message Data</div>

		<Checkbox bind:checked={savePresetElements.spinner_display} class="mx-2" />
		<div class="px-2">{$playerStateStore.spinner_display ? 'Visible' : 'Hidden'}</div>
		<div>Spinner Visibility</div>

		<Button
			class="flex justify-center col-span-3"
			on:click={() => {
				savePreset(presetName, buildPreset(savePresetElements));
				savePresetElements = setStateFalse();
				presets = getPresets();
			}}>Save Current State</Button
		>
	</div>
</div>

<div class="grid grid-cols-[auto_1fr_auto]">
	{#each presets as preset (preset.key)}
		<Button
			on:click={() => {
				loadPresetFromObject(preset);
				ws.pushState({ state: $playerStateStore });
			}}>{preset.key}</Button
		>
		<div>
			Clicking this preset will:
			{[
				preset.state.background_image_display
					? `Show background image ${preset.state.background_image_id}`
					: preset.state.background_image_id
					? `Set background image to ${preset.state.background_image_id} (hidden)`
					: '',
				preset.state.handout_display
					? `Show handout image ${preset.state.handout_image_id}`
					: preset.state.handout_image_id
					? `Set handout image to ${preset.state.handout_image_id} (hidden)`
					: '',
				preset.state.map_display
					? `Show map image ${preset.state.map_image_id}`
					: preset.state.map_image_id
					? `Set map image to ${preset.state.map_image_id} (hidden) @ ${JSON.stringify(
							preset.state.map_data
					  )}`
					: '',
				preset.state.message_display ? `Show message ${preset.state.message_id}` : '',
				preset.state.spinner_display ? `Show spinner` : '',
				preset.state.combat_display ? `Show combat ${preset.state.combat?.combat_id}` : ''
			]
				.filter((p) => p)
				.join(', ')}
		</div>
		<Button
			on:click={() => {
				deletePreset(preset.key);
				presets = presets.filter((p) => p.key !== preset.key);
			}}
		>
			<Trash2 class="h-2 w-4 mr-1" />Delete Preset
		</Button>
	{/each}
</div>
