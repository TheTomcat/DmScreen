<script lang="ts">
	import ImageTag from '$lib/components/ImageTag.svelte';
	import { Link } from 'lucide-svelte';
	import type { EntityByID, Tag } from '../../../../app';
	import * as Popover from '$lib/components/ui/popover';
	import Button from '$lib/components/ui/button/button.svelte';
	import PopoverContent from '$lib/components/ui/popover/popover-content.svelte';

	export let entities: EntityByID[];
</script>

<div class="flex flex-row justify-center items-center">
	{#if entities.length}
		<Popover.Root portal={null}>
			<Popover.Trigger asChild let:builder>
				<Button variant="ghost" builders={[builder]}>
					<Link />
				</Button>
			</Popover.Trigger>
			<PopoverContent>
				<div class="grid gap-4">
					<div class="space-y-2">
						<h4 class="font-medium leading-none">Entities</h4>
						<p class="text-sm text-muted-foreground">
							The following entities are linked to this image:
						</p>
					</div>
					{#each entities as entity}
						<Button>{entity.entity_id}</Button>
					{/each}
				</div>
			</PopoverContent>
		</Popover.Root>
	{/if}
</div>
