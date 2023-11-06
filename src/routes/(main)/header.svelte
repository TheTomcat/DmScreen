<script lang="ts">
	import * as config from '$lib/config';
</script>

<nav>
	<a href="/" class="title">
		<b>{config.title}</b>
	</a>

	<ul class="links">
		<li>
			<a href="/messages" data-sveltekit-prefetch>Messages</a>
		</li>
		<li>
			<a href="/gallery" data-sveltekit-prefetch>Gallery</a>
		</li>
		<li>
			<a href="/manager" data-sveltekit-prefetch>Manager</a>
		</li>
		<li>
			<a href="/combat" data-sveltekit-prefetch>Combat</a>
		</li>
		<li>
			<a href="/library" data-sveltekit-prefetch>Library</a>
		</li>
		<li>
			<a href="/player" data-sveltekit-prefetch>Player View</a>
		</li>
	</ul>
	<button>Button</button>
</nav>

<style>
	nav {
		padding-block: var(--size-7);
	}
	.links {
		margin-block: var(--size-7);
	}
	a {
		color: inherit;
		text-decoration: none;
	}
	@media (min-width: 768px) {
		nav {
			display: flex;
			justify-content: space-between;
		}
		.links {
			display: flex;
			gap: var(--size-7);
			margin-block: 0;
		}
	}
</style>
