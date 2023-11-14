<script lang="ts">
	export let currentPage: number;
	export let totalItems: number;
	export let pageSize: number;
	$: totalPages = Math.ceil(totalItems / pageSize);
	$: from = (currentPage - 1) * pageSize + 1;
	$: to = from + pageSize;
</script>

<p>
	Page <code>{currentPage}</code> of <code>{totalPages}</code> (<code>{from}</code> -
	<code>{to - 1}</code>
	on <code>{totalItems}</code> items)
</p>
