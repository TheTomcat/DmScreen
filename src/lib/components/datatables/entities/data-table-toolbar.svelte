<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as DataTable from '$lib/components/ui/datatable';

	import type { TableViewModel } from 'svelte-headless-table';
	import { Button } from '$lib/components/ui/button';
	import { Cross, PlusCircle } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import type { ImageType, Entity, AnyEntity } from '../../../../app';

	import {
		pcTypes,
		hasImage,
		type pcType,
		type hasImageType,
		type hasDataType,
		hasData,
		type CRType,
		CRList,
		CR
	} from './data';
	import type { AnyPlugins } from 'svelte-headless-table/plugins';
	import * as Dialog from '$lib/components/ui/dialog';
	import CombatBuilder from '$lib/components/new/CombatBuilder/CombatBuilder.svelte';
	import client from '$lib/api/index';
	import { onMount } from 'svelte';

	export let tableModel: TableViewModel<Entity, AnyPlugins>;
	export let selection: Writable<number[]>;

	let selectedEntities: Entity[];

	let combatants: { entity: AnyEntity; count: number }[];

	const { pluginStates } = tableModel;
	const {
		filterValue
	}: {
		filterValue: Writable<string>;
	} = pluginStates.filter;

	const {
		filterValues
	}: {
		filterValues: Writable<{
			pc: pcType[];
			hasImage: hasImageType[];
			hasData: hasDataType[];
			cr: CRType[];
			source: string[];
		}>;
	} = pluginStates.colFilter;

	$: showReset = Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0);

	const getEntity = async (entity_id: number) => {
		return await client.GET('/entity/{entity_id}', { params: { path: { entity_id } } });
	};

	let sources: DataTable.selectType[] = [];
	const getSources = async () => {
		client.GET('/entity/sources').then((response) => {
			if (!response.data) return;
			//@ts-ignore
			sources = response.data.map((s: string | null) => {
				return {
					value: s ? s : '',
					label: s ? s : '<No source>',
					icon: undefined
				};
			});
		});
	};

	onMount(getSources);
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="Search..."
			class="h-8 w-[150px] lg:w-[250px]"
			type="search"
			bind:value={$filterValue}
		/>

		<DataTable.FacetedFilter
			bind:filterValues={$filterValues.pc}
			title="PC Type"
			options={pcTypes}
		/>
		<DataTable.FacetedFilter
			bind:filterValues={$filterValues.hasImage}
			title="Has Image"
			options={hasImage}
		/>
		<DataTable.FacetedFilter
			bind:filterValues={$filterValues.hasData}
			title="Has Data"
			options={hasData}
		/>
		<DataTable.FacetedFilter bind:filterValues={$filterValues.cr} title="CR" options={CR} />

		<DataTable.FacetedFilter
			bind:filterValues={$filterValues.source}
			title="Source"
			options={sources}
		/>
		{#if showReset}
			<Button
				on:click={() => {
					$filterValue = '';
					$filterValues.pc = [];
					$filterValues.hasData = [];
					$filterValues.hasImage = [];
					$filterValues.cr = [];
					$filterValues.source = [];
				}}
				variant="ghost"
				class="h-8 px-2 lg:px-3"
			>
				Reset
				<Cross class="ml-2 h-4 w-4" />
			</Button>
		{/if}
	</div>
	<div class="flex-1 text-sm text-muted-foreground text-right">
		{#if $selection.length}
			<Dialog.Root>
				<Dialog.Trigger>
					<Button
						class="h-8 flex items-center"
						on:click={async () => {
							let c = await Promise.all($selection.map((s) => getEntity(s)));
							//@ts-ignore
							combatants = c
								.filter((a) => a.data !== undefined)
								.map((a) => {
									return { count: 1, entity: a.data };
								});
						}}><PlusCircle class="h-4 w-4 mr-1" />Add {$selection.length} to Encounter</Button
					>
				</Dialog.Trigger>
				<Dialog.Content>
					<!-- <Dialog.Header>Combat Builder</Dialog.Header> -->
					<CombatBuilder bind:combatants />
				</Dialog.Content>
			</Dialog.Root>
		{/if}
		<!-- {$selection.length} entities selected. -->
	</div>
	<!-- <DataTableViewOptions {tableModel} /> -->
</div>
