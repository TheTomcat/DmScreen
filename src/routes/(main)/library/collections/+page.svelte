<script lang="ts">
	import ImageSelection from '$lib/components/ImageSelection.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
</script>

<ImageSelection />

<Button on:click={() => toast('Hello world')}>Show toast</Button>
