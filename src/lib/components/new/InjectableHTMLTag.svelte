<script lang="ts">
	import type { ComponentType } from 'svelte';

	// https://svelte.dev/repl/f54e07cfccef4f9aa92de0bc39769aa2?version=3.55.1

	/* The html content of the tag */
	export let html: string;
	/* regex: Regex that matches the parts of the html around which the component should be inserted
	 *  component: The component to insert
	 *  props: The props to pass to the component
	 * */
	type Rule = {
		regex: RegExp;
		component: ComponentType;
		props: any;
	};
	export let rules: Rule[]; //: {regex: RegExp, component: any, props: any}[];

	let parsedHTML = [html];
	rules.forEach((rule) => {
		parsedHTML = parsedHTML.map((substr) => substr.split(rule.regex)).flat();
	});
</script>

{#each parsedHTML as part}
	{@const match = rules.find((rule) => rule.regex.test(part))}
	{#if match}
		???
		<svelte:component this={match.component} {...match.props}>
			{@html part}
		</svelte:component>
	{:else}
		{@html part.toUpperCase()}
	{/if}
{/each}
