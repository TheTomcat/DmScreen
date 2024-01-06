<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	const newSessionName = (): string => {
		let id = Math.ceil(Math.random() * 1000);
		return `${id}`;
	};

	onMount(() => {
		let sessionName = localStorage.getItem('sessionName');
		if (!sessionName || $page.url.searchParams.has('reset')) {
			sessionName = newSessionName();
			localStorage.setItem('sessionName', sessionName);
		}
		goto(`/session/${sessionName}`);
	});
</script>
