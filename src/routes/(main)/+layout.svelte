<script lang="ts">
	import Header from './header.svelte';
	import Footer from './footer.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { Toaster } from '$lib/components/ui/sonner';

	// import 'open-props/style';
	// import 'open-props/normalize';
	// import 'open-props/buttons';
	//import '@picocss/pico';
	// import '../../app.css';
	import '../../app.pcss';

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
<Toaster />

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
		padding-inline: 2rem;
	}
	main {
		/* padding-block: 4rem; */
	}
	@media (min-width: 1440px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>
