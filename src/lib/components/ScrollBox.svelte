<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	export let items: string[];
	export let currentItem: string;
	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<div class="relative">
	<div class="lg:max-w-none">
		<div class="mb-4 flex items-center overflow-y-auto pb-3 md:pb-0 gap-3">
			{#each items as item, index (index)}
				{@const isActive = currentItem == item}
				<Button
					class={cn(
						'relative flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors bg-[unset] hover:text-primary',
						isActive ? 'font-medium text-primary' : 'text-muted-foreground'
					)}
					on:click={() => {
						currentItem = item;
					}}
				>
					{#if isActive}
						<div
							class="absolute inset-0 rounded-full bg-muted"
							in:send={{ key: 'activetab' }}
							out:receive={{ key: 'activetab' }}
						/>
					{/if}
					<div class="relative">
						{item}
					</div>
				</Button>
			{/each}
		</div>
	</div>
</div>
