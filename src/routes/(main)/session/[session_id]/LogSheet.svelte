<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Textarea } from '$lib/components/ui/textarea';
	import { logStore, push, clear } from '$lib/stores/logStore';
	import { cn } from '$lib/utils';
	import { MoreHorizontal, Send, TabletSmartphone } from 'lucide-svelte';

	import * as Card from '$lib/components/ui/card';
	import { parseAction } from '$lib/jsonschema';
	import { roll } from '$lib/index';

	export let logSheetOpen: boolean = false;
	let message: string = '';
	const populate = () => {
		let l = $logStore.length;
		for (let i = 0; i <= 5; i++) {
			push(`A message ${l + i}`);
		}
	};

	const handleSubmit = () => {
		// populate();
		push(parseMessage(message));
		message = '';
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key == 'Enter') {
			if (e.shiftKey) return;
			e.preventDefault();
			handleSubmit();
		} else if (e.key == '@') {
		}
	};

	const renderTimestamp = (t: number) => {
		let d = new Date(t);
		let [a, b, c] = [d.getHours(), d.getMinutes(), d.getSeconds()];
		return `${a < 10 ? '0' : ''}${a}:${b < 10 ? '0' : ''}${b}:${c < 10 ? '0' : ''}${c}`;
	};

	const parseMessage = (m: string) => {
		return parseAction(m, commandProcess);
	};

	const commandProcess = (command: string, parameter: string) => {
		if (command == 'dice') {
			return `${parameter}: ${roll(parameter, 'random')}`;
		} else if (command == 'table') {
			return 'Rolltables are not yet implemented';
		}

		return parameter;
	};

	const dice = (d: number): number => {
		return Math.floor(Math.random() * d) + 1;
	};

	const rolldice = (d: number) => {
		return () => {
			message = `{@dice 1d${d}}`;
			handleSubmit();
			// return `1d${d}: ${dice(d)}`;
		};
	};
	const roll20 = rolldice(20);
</script>

<Sheet.Root bind:open={logSheetOpen}>
	<Sheet.Content side="right" class="sm:max-w-[500px]">
		<!-- <div class="" > -->
		<h1>Log</h1>
		<div
			class=" flex items-end border-solid border rounded-lg overflow-y-scroll h-[90%] flex-col justify-end w-full gap-4 pb-2"
		>
			{#each $logStore.sort((a, b) => a.timestamp - b.timestamp) as logitem}
				<Card.Root class="w-[93%] mx-3">
					<Card.Content class={cn(' mx-3 my-1 p-2', logitem.styling)}>
						{#if logitem.action}
							<div class="flex justify-between">
								{logitem.message}
								<Button on:click={logitem.action.onClick}>
									{#if logitem.action.icon}
										<svelte:component this={logitem.action.icon} class="h-4 w-4 mr-1" />
									{/if}
									{logitem.action.label}
								</Button>
							</div>
						{:else}
							{logitem.message}
						{/if}
					</Card.Content>
					<Card.Footer class="pb-1 pr-1 w-full">
						<div class="w-full text-right text-sm text-gray-500">
							{renderTimestamp(logitem.timestamp)}
						</div>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
		<!-- </div> -->
		<div class="sticky bottom-0 flex w-full gap-1 h-[10%] mt-2">
			<Textarea bind:value={message} on:keydown={handleKeyPress} class="h-full" />
			<div class="flex flex-col">
				<Button disabled={message === ''} on:click={handleSubmit} class="h-full">
					<Send class="h-4 w-4" /></Button
				>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="secondary"
							><MoreHorizontal class="h-4 w-4" /></Button
						>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item on:click={roll20}>1d20</DropdownMenu.Item>
						<DropdownMenu.Item>A</DropdownMenu.Item>
						<DropdownMenu.Item>A</DropdownMenu.Item>
						<DropdownMenu.Item>A</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
