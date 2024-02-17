<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Toggle } from '$lib/components/ui/toggle';
	import { PlusCircle } from 'lucide-svelte';
	import type { RollTable } from '../../../../app';

	import { MoreHorizontal } from 'lucide-svelte';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { roll } from 'svelte-legos';
	import type { EventHandler } from 'svelte/elements';
	let open: boolean = false;

	export let rolltable: RollTable;

	const renderRoll = (weight: number, sofar: number) => {
		if (weight == 1) return `${sofar + 1}`;
		return `${sofar + 1}-${sofar + weight}`;
	};
	const handleChange = (i: number): EventHandler => {
		return (e: Event) => {
			//@ts-ignore
			rolltable.rows[i].weight = parseInt(e.target?.value);
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}>Edit</Button>
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[70vh] overflow-clip">
		<Dialog.Header>
			<Dialog.Title>Roll Table</Dialog.Title>
			<Dialog.Description>Create a new rolltable</Dialog.Description>
		</Dialog.Header>
		<Input bind:value={rolltable.name} />
		<div class="overflow-y-scroll h-[50vh]">
			<!-- This is absolutely the wrong thing to do here...-->
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head
							>Roll 1d{rolltable.rows.reduce(
								(partialSum, r) => partialSum + (r.weight || 1),
								0
							)}</Table.Head
						>
						<Table.Head>Name</Table.Head>
						<!-- <Table.Head >Display Name</Table.Head> -->
						<!-- <Table.Head>Category</Table.Head> -->
						<Table.Head>Weight</Table.Head>
						<Table.Head>Row Action</Table.Head>
						<!-- <Table.Head /> -->
					</Table.Row>
				</Table.Header>
				<Table.Body class="overflow-clip">
					{#each rolltable.rows as row, i}
						{@const currentRow = rolltable.rows[i]}
						{@const sofar = rolltable.rows
							.slice(0, i)
							.reduce((partialSum, r) => partialSum + (r.weight || 1), 0)}
						<Table.Row>
							<Table.Cell>{renderRoll(row.weight || 1, sofar)}</Table.Cell>
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
												rolltable.rows = [
													...rolltable.rows,
													{ ...row, rolltable_row_id: undefined }
												];
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
												rolltable.rows.splice(i, 1);
												rolltable.rows = rolltable.rows;
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
					<Table.Row>
						<Table.Cell colspan={4}>
							<Button
								on:click={() => {
									rolltable.rows = [...rolltable.rows, { name: '', weight: 1 }];
								}}><PlusCircle class="h-4 w-4 mr-1" />Add Result</Button
							>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</div>
		<Dialog.Footer>
			<Button variant="destructive">Close</Button>
			<Button>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
