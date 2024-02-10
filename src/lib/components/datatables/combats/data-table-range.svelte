<script lang="ts">
	import { PlusCircle, Check, Filter } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';

	import Slider from '$lib/components/ui/slider/slider.svelte';
	import { Input } from '$lib/components/ui/input';
	// import type { imageTypes } from './data';

	export let filterValues: [number | undefined, number | undefined] = [undefined, undefined];
	export let title: string;

	let min: string;
	let max: string;

	const handleChange = (minChanged: boolean) => {
		let nmin = parseInt(min);
		let nmax = parseInt(max);
		if (nmin > nmax && minChanged) {
			max = min;
		} else if (nmax < nmin && !minChanged) {
			min = max;
		}
		filterValues = [parseInt(min), parseInt(max)];
	};
</script>

<div class="flex flex-row">
	<Input bind:value={min} type="number" on:change={() => handleChange(true)} class="w-20 h-8" />
	-
	<Input bind:value={max} type="number" on:change={() => handleChange(false)} class="w-20 h-8" />
</div>
