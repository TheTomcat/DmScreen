<script>
</script>

<h1 class="text-3xl font-bold underline">Welcome to DM Driver</h1>
<main>
	<div class="display">
		<a class="nav" href="/library/messages">Messages</a>
		<a class="nav" href="/gallery">Gallery</a>
		<a class="nav" href="/manager">Asset Manager</a>
		<a class="nav" href="/build">Combat Builder</a>
		<a class="nav" href="/session/1">Run</a>
		<a class="nav disabled">Player View</a>
	</div>
</main>

<style>
	.display {
		padding-top: var(--size-3);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		row-gap: var(--size-5);
		column-gap: var(--size-5);
	}
	.nav {
		font-size: large;
		color: var(--brand);
		height: var(--size-13);
		border-radius: var(--size-3);
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.disabled {
		background-color: var(--gray-10);
	}

	.nav:hover {
		background-color: var(--surface-4);
		box-shadow: var(--size-2) var(--size-2) var(--size-1) var(--gray-10);
	}
	.disabled:hover {
		background-color: var(--gray-10);
		box-shadow: unset;
		cursor: not-allowed;
	}
</style>
