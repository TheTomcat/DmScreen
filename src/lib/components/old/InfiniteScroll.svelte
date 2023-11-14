<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

	export let threshold = 0;
	export let horizontal = false;
	export let elementScroll: HTMLElement;
	export let hasMore = true;

	const dispatch = createEventDispatcher();
	let isLoadMore = false;
	let component: HTMLElement;

	$: {
		if (component || elementScroll) {
			if (component.parentNode) {
				const element = elementScroll ? elementScroll : component.parentNode;

				element.addEventListener('scroll', onScroll);
				element.addEventListener('resize', onScroll);
			}
		}
	}

	const onScroll = (e: Event) => {
		const element = e.target;
		if (!e.target) return;

		const offset = horizontal
			? e.target.scrollWidth - e.target.clientWidth - e.target.scrollLeft
			: e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;

		if (offset <= threshold) {
			if (!isLoadMore && hasMore) {
				dispatch('loadMore');
			}
			isLoadMore = true;
		} else {
			isLoadMore = false;
		}
	};

	onDestroy(() => {
		if (component || elementScroll) {
			if (!component.parentNode) return;
			const element = elementScroll ? elementScroll : component.parentNode;

			element.removeEventListener('scroll', null);
			element.removeEventListener('resize', null);
		}
	});
</script>

<div bind:this={component} style="width:0px" />
