<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card';
	import Label from '$lib/components/ui/label/label.svelte';

	let code: string;
	let password: string;
	let error: string;

	const enterRoom = () => {
		if (!code) {
			error = 'You must enter a valid room code';
		} else {
			goto(`/room/${code}`);
		}
	};
</script>

<div class="flex justify-center items-center m-auto h-screen">
	<Card.Root class="w-[300px]">
		<Card.Header>
			<Card.Title>Player Room</Card.Title>
			<Card.Description>Please enter a room code</Card.Description>
		</Card.Header>
		<Card.Content>
			<Label>Room Code</Label>
			<Input
				placeholder="Please enter a room code..."
				bind:value={code}
				class={`cursor-text ${!!error ? 'invalid' : ''}`}
				data-form-type="other"
				on:keydown={(e) => {
					error = '';
					if (e.key == 'Enter') {
						enterRoom();
					}
				}}
			/>
			<p class="text-xs text-red-600">
				{#if error}
					{error}
				{:else}&nbsp;
				{/if}
			</p>
			<!-- <Input
                placeholder="Password"
                bind:value={password}
                
                class="cursor-text"
                data-form-type="other"
                /> -->
		</Card.Content>
		<Card.Footer class="flex justify-end">
			<Button on:click={enterRoom}>Go</Button>
		</Card.Footer>
	</Card.Root>
</div>

<style>
	@keyframes shake {
		0% {
			margin-left: 0rem;
		}
		25% {
			margin-left: 0.25rem;
		}
		75% {
			margin-left: -0.25rem;
		}
		100% {
			margin-left: 0rem;
		}
	}

	:global(.invalid) {
		animation: shake 0.2s ease-in-out 0s 2;
		box-shadow: 0 0 0.6rem #ff0000;
	}
</style>
