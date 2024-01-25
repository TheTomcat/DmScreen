<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Tag } from '../../app';
	import { createEventDispatcher } from 'svelte';
	import { cn } from '$lib/utils';

	let className: string = '';
	export { className as class };
	export let tag: Tag;
	export let interactive: boolean = true;
	export let highlight: boolean = false;
	export let small: boolean = false;
	let dispatch = createEventDispatcher<{ click: undefined; clickclose: undefined }>();
</script>

<button
	class={cn(
		'flex items-center gap-1 bg-orange-400 text-black rounded-full shadow-gray-700 shadow-md m-2 cursor-default pl-3 pr-2 py-1',
		interactive && 'cursor-default',
		small && 'text-sm px-2 py-0 m-1',
		highlight && 'bg-purple-500',
		className
	)}
	on:click={() => dispatch('click')}
>
	<span>
		{tag.tag}
	</span>
	{#if interactive}
		<button
			class={cn('close', interactive && 'cursor-pointer')}
			tabindex="0"
			on:click={() => dispatch('clickclose')}
		>
			<X class="w-4 h-4 ml-1" />
		</button>
	{/if}
</button>
