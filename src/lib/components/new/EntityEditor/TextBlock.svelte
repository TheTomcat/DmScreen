<script lang="ts">
	import { parseAction } from '$lib/jsonschema';

	export let text: string;
	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<span class={className}>
	{@html parseAction(text)}
</span>
