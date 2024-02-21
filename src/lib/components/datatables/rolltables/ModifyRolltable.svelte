<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Toggle } from '$lib/components/ui/toggle';
	import { PlusCircle } from 'lucide-svelte';
	import type { RollTable, RollTableCreate, RollTableUpdate } from '../../../../app';

	import { MoreHorizontal } from 'lucide-svelte';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { EventHandler } from 'svelte/elements';
	import client from '$lib/api/index';
	import { createEventDispatcher } from 'svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { accumulate, calcTotalWeight, renderRollRange } from '$lib';

	export let open: boolean = false;

	const dispatch = createEventDispatcher<{
		createRolltable: RollTableCreate;
		updateRollTable: RollTableUpdate;
	}>();

	export let rollTable: RollTableUpdate;

	const handleChange = (i: number): EventHandler => {
		return (e: Event) => {
			//@ts-ignore
			if (!e.target?.value) return;
			//@ts-ignore
			rollTable.rows[i].weight = parseInt(e.target?.value);
		};
	};

	const handleSubmit = (e: Event) => {
		dispatch('updateRollTable', { ...rollTable });
		// rollTable = { name: '', rows: [] };
		open = false;
	};
	let mode: boolean = true;
	let manualOptions: string;

	const processOptions = (name: string, options: string): RollTableCreate | RollTableUpdate => {
		return {
			name,
			rows: options.split('\n').map((opt) => {
				let [name, weight] = opt.split(',');
				return {
					name,
					weight: parseInt(weight) || 1
				};
			})
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}><PlusCircle class="h-4 w-4 mr-1" />Edit</Button>
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[70vh] overflow-clip">
		<Dialog.Header>
			<Dialog.Title>Roll Table</Dialog.Title>
			<Dialog.Description class="flex justify-between items-center">
				Create a new rolltable
				<Toggle variant="outline" class="h-8" bind:pressed={mode}>Toggle Input Mode</Toggle>
			</Dialog.Description>
		</Dialog.Header>
		<Input bind:value={rollTable.name} placeholder="Enter a name for the Roll Table" />
		<div class="overflow-y-scroll h-[50vh]">
			{#if mode}
				<!-- This is absolutely the wrong thing to do here...-->
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Roll 1d{calcTotalWeight(rollTable)}</Table.Head>
							<Table.Head>Name</Table.Head>
							<!-- <Table.Head >Display Name</Table.Head> -->
							<!-- <Table.Head>Category</Table.Head> -->
							<Table.Head>Weight</Table.Head>
							<Table.Head>Row Action</Table.Head>
							<!-- <Table.Head /> -->
						</Table.Row>
					</Table.Header>
					<Table.Body class="overflow-clip">
						{#if rollTable.rows}
							{#each rollTable.rows as row, i}
								{@const currentRow = rollTable.rows[i]}
								{@const sofar = rollTable.rows.slice(0, i).reduce(accumulate, 0)}
								<Table.Row>
									<Table.Cell>{renderRollRange(row.weight || 1, sofar)}</Table.Cell>
									<Table.Cell><Input bind:value={row.name} /></Table.Cell>
									<!-- <Table.Cell ><Input bind:value={rolltable.rows[i].display_name} /></Table.Cell> -->
									<!-- <Table.Cell
							><Input bind:value={row.category} placeholder="Category (optional)" /></Table.Cell
						> -->
									<Table.Cell
										><Input
											value={row.weight}
											on:change={handleChange(i)}
											type="number"
											min={1}
										/></Table.Cell
									>
									<!-- <Table.Cell>
							<Toggle pressed={!!row.extra_data} />
						</Table.Cell> -->
									<Table.Cell>
										<DropdownMenu.Root>
											<DropdownMenu.Trigger asChild let:builder>
												<Button
													variant="ghost"
													builders={[builder]}
													class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
												>
													<MoreHorizontal class="h-4 w-4" />
													<span class="sr-only">Open menu</span>
												</Button>
											</DropdownMenu.Trigger>
											<DropdownMenu.Content class="w-[160px]" align="end">
												<DropdownMenu.Item>Edit Extra Data</DropdownMenu.Item>
												<DropdownMenu.Item
													on:click={() => {
														if (!rollTable.rows) return;
														rollTable.rows = [...rollTable.rows, { ...row }];
													}}
												>
													Make a copy
												</DropdownMenu.Item>
												<DropdownMenu.Item>Favorite</DropdownMenu.Item>
												<DropdownMenu.Separator />
												<!-- <DropdownMenu.Sub>
                                        <DropdownMenu.SubTrigger>Labels</DropdownMenu.SubTrigger>
                                        <DropdownMenu.SubContent>
                                            <DropdownMenu.RadioGroup value={task.label}>
                                                {#each labels as label}
                                                    <DropdownMenu.RadioItem value={label.value}>
                                                        {label.label}
                                                    </DropdownMenu.RadioItem>
                                                {/each}
                                            </DropdownMenu.RadioGroup>
                                        </DropdownMenu.SubContent>
                                    </DropdownMenu.Sub>
                                    <DropdownMenu.Separator /> -->
												<DropdownMenu.Item
													on:click={() => {
														if (!rollTable.rows) return;
														rollTable.rows.splice(i, 1);
														rollTable.rows = rollTable.rows;
													}}
												>
													Delete
													<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
						<Table.Row>
							<Table.Cell colspan={4}>
								<Button
									on:click={() => {
										if (!rollTable.rows) {
											rollTable.rows = [];
											return;
										}

										rollTable.rows = [...rollTable.rows, { name: '', weight: 1 }];
									}}><PlusCircle class="h-4 w-4 mr-1" />Add Result</Button
								>
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			{:else}
				<div class="flex flex-col justify-between h-full gap-1">
					<div class="flex h-full">
						<Textarea
							class="h-full"
							placeholder="Enter the roll table options one per line."
							bind:value={manualOptions}
						/>
					</div>
				</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Button
				variant="destructive"
				on:click={() => {
					open = false;
				}}
			>
				Close
			</Button>
			{#if mode}
				<Button on:click={handleSubmit}>Save</Button>
			{:else}
				<Button
					on:click={() => {
						if (!manualOptions) {
							rollTable = { name: rollTable.name, rows: [] };
						} else {
							rollTable = processOptions(rollTable.name || '', manualOptions);
						}
						mode = !mode;
					}}
				>
					Parse
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
