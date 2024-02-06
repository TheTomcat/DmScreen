<script lang="ts">
	import ImageSelection from '$lib/components/ImageSelection.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { favouriteStore, type Favourite } from '$lib/stores/favouriteStore';
</script>

<ImageSelection tabvalue="favourites" />

<Button on:click={() => toast('Hello world')}>Show toast</Button>
