<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';

	// import 'open-props/style';
	// import 'open-props/normalize';
	// import 'open-props/buttons';
	//import '@picocss/pico';
	import '../../app.pcss';

	let options = {
		//https://github.com/zerodevx/svelte-toast
	};
</script>

<main class="bg-background">
	<slot />
</main>
<SvelteToast {options} />

<style>
	@media (min-width: 1440px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>
