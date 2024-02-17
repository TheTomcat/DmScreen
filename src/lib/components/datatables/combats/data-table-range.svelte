<script lang="ts">
	import { Filter, FilterX } from 'lucide-svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { plural } from '$lib';

	export let filterValues: [number | null, number | null] = [null, null];
	export let title: string;

	let open: boolean = false;

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

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="sm" class="h-8 border-dashed">
			{#if filterValues[0] && filterValues[1]}
				Between {filterValues[0]} and {filterValues[1]} {plural(filterValues[1], 'participant')}
			{:else if filterValues[0]}
				Over {filterValues[0]} {plural(filterValues[0], 'participant')}
			{:else if filterValues[1]}
				Under {filterValues[1]} {plural(filterValues[1], 'participant')}
			{:else}
				<!-- if filterValues[0] == undefined && filterValues[1] == undefined} -->
				<Filter class="mr-2 h-4 w-4" />
				{title}
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] " align="start" side="bottom">
		<div class="grid gap-4">
			<!-- <div class="space-y-2">
				<h4 class="font-medium leading-none">Dimensions</h4>
				<p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
			</div> -->
			<div class="grid gap-2">
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="min">Min</Label>
					<Input
						bind:value={min}
						type="number"
						on:change={() => handleChange(true)}
						class="col-span-2 h-8"
					/>
					<!-- <Input id="min" value="100%" class="col-span-2 h-8" /> -->
				</div>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="max">Max</Label>
					<!-- <Input id="max" value="300px" class="col-span-2 h-8" /> -->
					<Input
						bind:value={max}
						type="number"
						on:change={() => handleChange(false)}
						class="col-span-2 h-8"
					/>
				</div>
				<div class="grid">
					<Button
						variant="outline"
						on:click={() => {
							filterValues = [null, null];
							open = false;
						}}><FilterX class="w-4 h-4 mr-1" />Clear</Button
					>
				</div>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
