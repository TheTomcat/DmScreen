<script lang="ts">
	const pages = ['manager', 'gallery', 'messages', 'sessions'];
	export let currentPage: string;

	$: displayName = toSentenceCase(currentPage);

	function toSentenceCase(input: string): string {
		return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
	}
</script>

<nav class="container-fluid">
	<ul>
		<li />
		<li>title</li>
	</ul>
	<ul>
		{#each pages as page}
			<li>
				{#if page === currentPage}
					<a href="/{page}">{displayName}</a>
				{:else}
					<a class="secondary" href="/{page}">{displayName}</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
<hr />
