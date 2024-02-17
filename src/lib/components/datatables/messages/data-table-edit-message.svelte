<script lang="ts">
	import type { Message } from '../../../../app';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Pencil } from 'lucide-svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import client from '$lib/api/index';
	import { toast } from 'svelte-sonner';

	export let message: Message;
	let open: boolean = false;

	const modifyMessage = async (message_id: number, message: string) => {
		return await client
			.PATCH('/message/{message_id}', {
				params: {
					path: { message_id }
				},
				body: { message }
			})
			.then((response) => {
				if (!response || response.error) throw new Error('A problem hath occurred');
			});
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}><Pencil class="w-4 h-4 mr-1" /> Edit</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>Edit Message</Dialog.Header>
		<Textarea bind:value={message.message} />
		<Dialog.Footer>
			<Button variant="destructive" on:click={() => (open = false)}>Close</Button>
			<Button
				on:click={() => {
					modifyMessage(message.message_id, message.message)
						.then(() => toast('Message Updated Successfully'))
						.catch((e) => toast(`An error occurred: ${JSON.stringify(e)}`));
					open = false;
				}}>Save</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
