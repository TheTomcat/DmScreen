<script lang="ts">
	import { parseAction } from '$lib/jsonschema';

	export let text: string;
	export let className: string = '';
</script>

<span class={className}>
	{@html parseAction(text)}
</span>
