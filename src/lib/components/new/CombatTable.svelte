<script lang="ts">
	import client from '$lib/api/index';
	import Pagination from '$lib/components/Pagination.svelte';
	import * as Table from '$lib/components/ui/table';
	import Button from '$lib/components/ui/button/button.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Combat } from '../../../app';
	import type { wsController } from '$lib/ws';
	import { Play } from 'lucide-svelte';
	let currentPage: number = 1;
	let numPages: number = 1;

	const dispatch = createEventDispatcher<{ select_combat: { combat: Combat } }>();
	export let ws: wsController;

	const getCombats = async (page: number = 1) => {
		return client.GET('/combat/', { params: { query: { page, size: 10 } } }).then((response) => {
			if (!response.data) return [];
			currentPage = response.data.page || 1;
			numPages = response.data.pages || 1;
			return response.data.items;
		});
	};
</script>

Combat
{#await getCombats()}
	Loading combats...
{:then combats}
	<Pagination {currentPage} {numPages} on:change={() => {}} />
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Id</Table.Head>
				<Table.Head>Title</Table.Head>
				<Table.Head>No. participants</Table.Head>
				<Table.Head>Load</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each combats as combat}
				<Table.Row>
					<Table.Cell>{combat.combat_id}</Table.Cell>
					<Table.Cell>{combat.title}</Table.Cell>
					<Table.Cell>{combat.participants.length}</Table.Cell>
					<Table.Cell>
						<Button variant="secondary" on:click={() => dispatch('select_combat', { combat })}
							>Load Combat<Play class="w-4 h-4 ml-1" /></Button
						>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={4}>No combats found</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/await}
