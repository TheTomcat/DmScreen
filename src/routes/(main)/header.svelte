<script lang="ts">
	import * as config from '$lib/config';
</script>

<nav>
	<a href="/" class="title">
		<b>{config.title}</b>
	</a>

	<ul class="links">
		<li>
			<a href="/build">Build</a>
		</li>
		<li>
			<a href="/maintain">Manage</a>
		</li>
		<li>
			<a href="/run">Run</a>
		</li>
		<li>
			<a href="/view">View</a>
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
