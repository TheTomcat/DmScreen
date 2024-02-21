<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { logStore, push, clear } from '$lib/stores/logStore';
	import { cn } from '$lib/utils';
	import { Send } from 'lucide-svelte';
	let message: string;
	const populate = () => {
		let l = $logStore.length;
		for (let i = 0; i <= 5; i++) {
			push(`A message ${l + i}`);
		}
	};
</script>

<div class="flex flex-col-reverse items-end border-solid border rounded-lg h-[70vh] gap-2">
	<div class="flex w-full gap-1">
		<Input bind:value={message} />
		<Button on:click={populate}><Send class="h-4 w-4" /></Button>
	</div>
	<div class="flex flex-col justify-end w-full gap-2 overflow-y-scroll h-full">
		{#each $logStore.sort((a, b) => a.timestamp - b.timestamp) as logitem}
			<div class={cn('border rounded-md mx-3 my-1 p-2', logitem.styling)}>
				{logitem.message}
			</div>
		{/each}
	</div>
</div>
