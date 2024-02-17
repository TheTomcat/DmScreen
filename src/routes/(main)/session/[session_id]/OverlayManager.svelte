<script lang="ts">
	import { FileSearch, LocateOff, MapIcon, RefreshCw } from 'lucide-svelte';
	import { playerStateStore, wsController } from '$lib/ws';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Toggle } from '$lib/components/ui/toggle';

	export let ws: wsController;
	export let selectionOpen: boolean = false;
	export let imageSelectionMode: 'backdrop' | 'handout' | 'map' = 'backdrop';
</script>

<div class="grid gap-2" style="grid-template-columns: auto 1fr;">
	<div class="flex flex-col justify-center">Message:</div>
	<div class="flex gap-3 justify-start">
		<Toggle
			variant="outline"
			bind:pressed={$playerStateStore.message_cycle}
			onPressedChange={(e) => {
				ws.setLoadingMessage({
					cycle: !$playerStateStore.message_cycle,
					display: $playerStateStore.message_display,
					timeout: $playerStateStore.message_timeout,
					message_id: $playerStateStore.message_id
				});
			}}
		>
			<RefreshCw class="w-4 h-4 mr-2" />
			Cycle Message
		</Toggle>

		<Input placeholder="Timeout" bind:value={$playerStateStore.message_timeout} class="w-[200px]" />
	</div>

	<div class="flex flex-col justify-center">Handout:</div>
	<div class="flex gap-3 justify-start">
		<Input
			placeholder="Handout ID"
			bind:value={$playerStateStore.handout_image_id}
			class="w-[200px]"
		/>
		<Button
			variant="secondary"
			on:click={() => {
				imageSelectionMode = 'handout';
				selectionOpen = true;
			}}><FileSearch class="w-4 h-4 mr-2" />Select Handout...</Button
		>
	</div>
	<div class="flex flex-col justify-center">Map:</div>
	<div class="flex gap-3 justify-start">
		<Input placeholder="Map ID" bind:value={$playerStateStore.map_image_id} class="w-[200px]" />
		<Button
			variant="secondary"
			on:click={() => {
				imageSelectionMode = 'map';
				selectionOpen = true;
			}}><MapIcon class="w-4 h-4 mr-2" />Select Map...</Button
		>
		<Button
			variant="destructive"
			disabled={$playerStateStore.map_data == undefined}
			on:click={() => {
				ws.setMap({
					map_data: {
						x: 0.5,
						y: 0.5,
						scale: 1,
						transition: $playerStateStore.map_data?.transition || 1000
					},
					display: $playerStateStore.map_display,
					map_id: $playerStateStore.map_image_id
				});
			}}><LocateOff class="h-4 w-4 mr-2" />Reset Map Focus</Button
		>
	</div>
</div>
