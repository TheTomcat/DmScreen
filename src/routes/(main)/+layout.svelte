<script lang="ts">
	import Header from './header.svelte';
	import Footer from './footer.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';

	import 'open-props/style';
	import 'open-props/normalize';
	import 'open-props/buttons';
	//import '@picocss/pico';
	import '../../app.css';

	let options = {
		//https://github.com/zerodevx/svelte-toast
	};
</script>

<div class="layout">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>
<SvelteToast {options} />

<!-- <script>
    import "../app.css";
  </script>
  <div class="container mx-auto my-6 max-w-lg">
  <slot />
</div> -->
<style>
	.layout {
		height: 100%;
		max-inline-size: 1440px;
		display: grid;
		grid-template-rows: auto 1fr auto;
		margin-inline: auto;
		padding-inline: var(--size-7);
	}
	main {
		padding-block: var(--size-9);
	}
	@media (min-width: 1440px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>
