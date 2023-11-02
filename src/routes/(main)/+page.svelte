<script>
	import { onMount } from 'svelte';
	import { allTags, getTags } from '../../stores/tagStore';

	onMount(getTags);
</script>

<h1 class="text-3xl font-bold underline">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<main>
	<h1 class="text-2xl font-bold text-center text-gray-800 md:text-3xl">My Todos</h1>
</main>
