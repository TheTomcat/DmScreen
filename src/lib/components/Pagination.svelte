<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let currentPage: number;
	// export let totalItems: number;
	// export let pageSize: number;
	export let numPages: number;

	const dispatch = createEventDispatcher<{
		change: number;
	}>();

	function range(size: number, startAt: number = 0): number[] {
		return [...Array(size).keys()].map((i) => i + startAt);
	}

	function changePage(page: number) {
		if (page !== currentPage) {
			dispatch('change', page);
		}
	}
</script>

<nav class="pagination">
	<ul>
		<li class={currentPage === 1 ? 'disabled' : ''}>
			<a href="javascript:void(0)" on:click={() => changePage(currentPage - 1)}>
				<span aria-hidden="true">«</span>
			</a>
		</li>
		{#each range(numPages, 1) as page}
			<li class={page === currentPage ? 'active' : ''}>
				<a
					href="javascript:void(0)"
					on:click={() => {
						console.log(page);
						changePage(page);
					}}>{page}</a
				>
			</li>
		{/each}
		<li class={currentPage === numPages ? 'disabled' : ''}>
			<a href="javascript:void(0)" on:click={() => changePage(currentPage + 1)}>
				<span aria-hidden="true">»</span>
			</a>
		</li>
	</ul>
</nav>

<style>
	.pagination {
		display: flex;
		justify-content: center;
	}
	.pagination ul {
		display: flex;
		padding-left: 0;
		list-style: none;
	}
	.pagination li a {
		position: relative;
		display: block;
		padding: 0.5rem 0.75rem;
		margin-left: -1px;
		line-height: 1.25;
		background-color: var(--surface-4);
		border: 1px solid var(--border);
	}

	.pagination li.active a {
		color: var(--brand);
		background-color: var(--brand-background);
		/* border-color: #007bff; */
	}

	.pagination li.disabled a {
		color: #6c757d;
		pointer-events: none;
		cursor: auto;
		/* border-color: #dee2e6; */
	}
</style>
