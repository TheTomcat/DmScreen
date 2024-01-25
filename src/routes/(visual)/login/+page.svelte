<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import type { PageData } from './$types';
	import { Lock } from 'lucide-svelte';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	export let data: PageData;
</script>

<!-- <SuperDebug data={data.form} /> -->

<div class="flex justify-center items-center m-auto h-screen">
	<Card.Root class="w-[300px]">
		<Card.Header>
			<Card.Title class="flex items-center"><Lock class="w-6 h-6 mr-3" /> Login</Card.Title>
			<Card.Description>Enter your credentials to log in</Card.Description>
		</Card.Header>
		<Card.Content>
			<LoginForm form={data.form} action="?/login" />
		</Card.Content>
		<!-- <Card.Footer class="flex justify-end">
			<Button on:click={enterRoom}>Go</Button>
		</Card.Footer> -->
	</Card.Root>
</div>
