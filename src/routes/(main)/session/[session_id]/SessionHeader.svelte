<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	// import { sessionStore, type Session, refresh } from '$lib/stores/sessionStore.js';
	import { tick } from 'svelte';
	import {
		Hourglass,
		Image,
		MapIcon,
		Megaphone,
		MegaphoneOff,
		Scroll,
		ScrollText,
		Swords
	} from 'lucide-svelte';
	import { Separator, Toolbar } from 'bits-ui';
	import { playerStateStore, wsController } from '$lib/ws';
	import { makeCancelable } from '$lib';
	// import Dialog from '$lib/components/Dialog.svelte';

	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Toggle } from '$lib/components/ui/toggle';

	import { cn } from '$lib/utils';
	import { tweened } from 'svelte/motion';
	import * as Popover from '$lib/components/ui/popover';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Switch } from '$lib/components/ui/switch';

	let announceTimer = tweened(100);

	export let ws: wsController;

	let announce = () => {
		if (autoClearAnnoucement) {
			ws.announce({
				message: announcement,
				timeout: $playerStateStore.announce_timeout,
				display: true
			});
		} else {
			ws.announce({
				message: announcement,
				timeout: $playerStateStore.announce_timeout,
				display: true
			});
		}
		if (autoClearAnnoucement) {
			setTimeout(clearAnnouncement, $playerStateStore.announce_timeout);
		}
	};
	let handleAnnounce = () => {
		if (!isAnnouncing) {
			isAnnouncing = true;
			announce();
			if (autoClearAnnoucement) {
				awaitingCancel = true;
				announceTimer.set(100, { duration: 0 });
				announcePromise = makeCancelable<void>(
					announceTimer.set(0, { duration: $playerStateStore.announce_timeout })
				);
				announcePromise.promise.then(() => {
					clearAnnouncement();
					isAnnouncing = false;
					awaitingCancel = false;
				});
			}
		} else {
			if (announcePromise) announcePromise.cancel();
			clearAnnouncement();
			isAnnouncing = false;
			awaitingCancel = false;
		}
	};
	let clearAnnouncement = () => {
		ws.clearAnnouncement();
	};
	let announcePromise: ReturnType<typeof makeCancelable<void>>;
	let announcement: string;
	let autoClearAnnoucement: boolean = false;
	let isAnnouncing = false;
	let awaitingCancel = false;

	let annoucementPopoverOpen: boolean = false;
</script>

<Toolbar.Root
	class="flex gap-2 h-12 min-w-max items-center justify-center rounded-10px  border-border bg-background p-1 shadow-mini"
>
	<Popover.Root portal={null} bind:open={annoucementPopoverOpen}>
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder={builder2}>
				{#if isAnnouncing}
					<Button builders={[builder2]} variant="outline" class="w-32" on:click={handleAnnounce}>
						<div class="flex flex-col w-full">
							<div class="flex flex-row justify-center">
								<MegaphoneOff class="w-4 h-4 mr-2" />
								Clear
							</div>
							{#if awaitingCancel}
								<div class="w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700">
									<div class="bg-blue-600 h-0.5 rounded-full" style="width: {$announceTimer}%" />
								</div>
							{/if}
						</div>
					</Button>
				{:else}
					<Popover.Trigger asChild let:builder>
						<Button
							builders={[builder, builder2]}
							variant="outline"
							class="w-32"
							on:click={(e) => {
								if (isAnnouncing) {
									e.preventDefault();
									handleAnnounce();
								}
							}}
						>
							{#if isAnnouncing}
								<div class="flex flex-col w-full">
									<div class="flex flex-row justify-center">
										<MegaphoneOff class="w-4 h-4 mr-2" />
										Clear
									</div>
									{#if awaitingCancel}
										<div class="w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700">
											<div
												class="bg-blue-600 h-0.5 rounded-full"
												style="width: {$announceTimer}%"
											/>
										</div>
									{/if}
								</div>
							{:else}
								<Megaphone class="w-4 h-4 mr-2" />Announce
							{/if}
						</Button>
					</Popover.Trigger>
				{/if}
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>Make an Annoucement</p>
			</Tooltip.Content>
		</Tooltip.Root>
		<Popover.Content class="w-80">
			<div class="grid gap-4">
				<div class="space-y-2">
					<h4 class="font-medium leading-none">Announcement</h4>
					<p class="text-sm text-muted-foreground">Make an annoucement</p>
				</div>
				<div class="grid gap-2">
					<div class="grid grid-cols-3 items-center gap-4">
						<Input
							bind:value={announcement}
							on:keydown={(e) => {
								if (e.key == 'Enter') {
									handleAnnounce();
									tick().then(() => {
										annoucementPopoverOpen = false;
									});
								}
							}}
							placeholder="Announce Message"
							class="col-span-3"
						/>
					</div>
					<div class="flex items-center justify-end space-x-2">
						<Label for="autoclear">Automatically Clear</Label>
						<Switch id="autoclear" bind:checked={autoClearAnnoucement} />
					</div>
					<div class="grid grid-cols-3 items-center gap-4">
						<Label for="timeout">Timeout</Label>
						<Input
							class="col-span-2"
							disabled={!autoClearAnnoucement}
							id="timeout"
							bind:value={$playerStateStore.announce_timeout}
							placeholder="Announce Timeout"
						/>
					</div>
					<Button
						on:click={() => {
							handleAnnounce();
							tick().then(() => {
								annoucementPopoverOpen = false;
							});
						}}><Megaphone />Announce</Button
					>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>

	<Separator.Root class="-my-1 mx-1 w-[1px] self-stretch bg-gray-600" />

	<Toggle
		variant="outline"
		bind:pressed={$playerStateStore.background_image_display}
		onPressedChange={(e) => {
			console.log('change');
			ws.setBackgroundImage({
				cycle: $playerStateStore.background_image_cycle,
				data: $playerStateStore.background_image_data,
				display: !$playerStateStore.background_image_display,
				timeout: $playerStateStore.background_image_timeout,
				image_id: $playerStateStore.background_image_id
			});
		}}
	>
		<Image class="w-4 h-4" />
		<!-- {showHide($playerStateStore.background_image_display)} Background -->
	</Toggle>
	<Separator.Root class="-my-1 mx-1 w-[1px] self-stretch bg-gray-600" />
	<Toggle
		variant="outline"
		bind:pressed={$playerStateStore.combat_display}
		onPressedChange={(e) => {
			ws.showCombat({
				display: !$playerStateStore.combat_display
			});
		}}
	>
		<Swords class="w-4 h-4 " />
		<!-- {showHide($playerStateStore.combat_display)} Combat -->
	</Toggle>

	<Separator.Root class="-my-1 mx-1 w-[1px] self-stretch bg-gray-600" />
	<Toggle
		variant="outline"
		bind:pressed={$playerStateStore.message_display}
		onPressedChange={(e) => {
			ws.setLoadingMessage({
				cycle: $playerStateStore.message_cycle,
				display: !$playerStateStore.message_display,
				timeout: $playerStateStore.message_timeout,
				message_id: $playerStateStore.message_id
			});
		}}
	>
		<ScrollText class="w-4 h-4 " />
		<!-- {showHide($playerStateStore.message_display)} Message -->
	</Toggle>
	<Toggle
		variant="outline"
		bind:pressed={$playerStateStore.spinner_display}
		onPressedChange={(e) => {
			ws.showSpinner({
				display: !$playerStateStore.spinner_display
			});
		}}
	>
		<Hourglass class={cn('w-4 h-4 ', $playerStateStore.spinner_display && 'animate-spin')} />
		<!-- {showHide($playerStateStore.spinner_display)} Loading Spinner -->
	</Toggle>
	<Toggle
		variant="outline"
		bind:pressed={$playerStateStore.handout_display}
		onPressedChange={(e) => {
			ws.setHandout({
				display: !$playerStateStore.handout_display,
				handout_id: $playerStateStore.handout_image_id
			});
		}}
		><Scroll class="w-4 h-4 " />
		<!-- {showHide($playerStateStore.handout_display)} Handout -->
	</Toggle>
	<Toggle
		variant="outline"
		bind:pressed={$playerStateStore.map_display}
		onPressedChange={(e) => {
			ws.setMap({
				display: !$playerStateStore.map_display,
				map_id: $playerStateStore.map_image_id,
				map_data: $playerStateStore.map_data
			});
		}}
		><MapIcon class="w-4 h-4" />
		<!-- {showHide($playerStateStore.map_display)} Map -->
	</Toggle>
	<Separator.Root class="-my-1 mx-1 w-[1px] self-stretch bg-dark-10" />
</Toolbar.Root>
