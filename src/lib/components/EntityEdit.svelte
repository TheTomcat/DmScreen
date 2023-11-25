<script lang="ts">
	import type { Entity } from '../../app';
	export let entity: Entity = {
		entity_id: 1,
		name: 'test',
		image_id: 1,
		is_PC: true,
		hit_dice: '6d6 + 3',
		ac: 10,
		cr: '1',
		initiative_modifier: 2,
		source: 'Custom',
		source_page: 4
	};
</script>

<section class="labelled-input">
	<label for="entityname">Name</label>
	<input id="entityname" name="name" bind:value={entity.name} placeholder="Name" />
	<label for="entityisPC">PC</label>
	<input id="entityisPC" name="entityisPC" bind:value={entity.is_PC} type="checkbox" />
	<label for="entityac">AC</label>
	<input id="entityac" name="ac" bind:value={entity.ac} placeholder="AC" class="number-input" />
	<label for="entitycr">CR</label>
	<input id="entitycr" name="cr" bind:value={entity.cr} placeholder="CR" class="number-input" />
	<label for="entityinitiativemodifier">Initiative Modifier</label>
	<input
		id="entityinitiativemodifier"
		name="initiativemodifier"
		bind:value={entity.initiative_modifier}
		placeholder="Initiative Modifier"
		class="number-input"
	/>
	<label for="entityhitdice">Hit Dice</label>
	<input id="entityhitdice" name="hitdice" bind:value={entity.hit_dice} placeholder="" />
	<label for="entitysource">Source</label>
	<div style="display: flex">
		<input
			id="entitysource"
			name="entity"
			bind:value={entity.source}
			placeholder="source"
			style="width:var(--size-10);"
		/>
		<input bind:value={entity.source_page} />
	</div>
	<label for="entityimage">Image</label>
	<div />
</section>

<style>
	.labelled-input {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: var(--size-3);
		flex-wrap: wrap;
		align-items: center;
	}
	.number-input {
		width: var(--size-11);
	}
</style>
