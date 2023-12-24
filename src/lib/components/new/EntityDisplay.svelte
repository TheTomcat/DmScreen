<script lang="ts">
	import type { Entity } from '../../../app';
	import Counter from './Counter.svelte';
	import EntityBlock from './EntityBlock.svelte';

	export let entity: Entity;
</script>

{#if !entity}
	No entity found
{:else}
	<div class="container">
		<div class="block">
			<h2>{entity.name}</h2>
			<div>
				Image: {entity.image_id}
			</div>
			<div>
				Source: {entity.source}, pg {entity.source_page}
			</div>
		</div>
		<div class="block grid2">
			<div>AC</div>
			<div>{entity.ac}</div>
			<div>CR</div>
			<div>{entity.cr}</div>
			<div>HP</div>
			<div>{entity.hit_dice}</div>
		</div>
		<div class="block stats">
			<div><span>Str</span><input type="number" /></div>
			<div><span>Dex</span><input type="number" /></div>
			<div><span>Con</span><input type="number" /></div>
			<div><span>Int</span><input type="number" /></div>
			<div><span>Wis</span><input type="number" /></div>
			<div><span>Cha</span><input type="number" /></div>
		</div>
		<div class="block">
			<h5>Saves</h5>
			<Counter title="Breath Weapon" total={5} numConsumed={3} />
		</div>
		<div class="block">
			<h5>Skills</h5>
		</div>
		<EntityBlock mode="value" heading="Speed" data={[{ title: 'Walk', desc: '30' }]} />
		<div class="block">
			<h5>Speed</h5>
		</div>
		<div class="block">
			<h5>Senses</h5>
		</div>
		<div class="block">
			<h5>Damage Vulnerabilities</h5>
		</div>
		<div class="block">
			<h5>Damage Resistances</h5>
		</div>
		<div class="block">
			<h5>Damage Immunities</h5>
		</div>
		<div class="block">
			<h5>Condition Immunities</h5>
		</div>
		<EntityBlock mode="simple" heading="Languages" data={[{ title: 'Common', desc: undefined }]} />

		<div class="block">
			<h5>Traits</h5>
		</div>
		<EntityBlock
			heading="Actions"
			mode="block"
			data={[{ title: 'Multiattack', desc: 'The blank makes two attacks with its things' }]}
		/>
		<EntityBlock mode="block" heading="Bonus Actions" data={[]} />
		<EntityBlock mode="block" heading="Reactions" data={[]} />
		<EntityBlock mode="block" heading="Legendary Actions" data={[]} />
		<EntityBlock mode="block" heading="Mythic Actions" data={[]} />
	</div>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}
	.stats {
		display: flex;
		flex-direction: row;
		gap: var(--size-3);
	}
	.stats > div {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.stats > div > input {
		width: var(--size-11);
	}
	.grid2 {
		display: grid;
		grid-template-columns: auto 1fr;
	}
	.grid3 {
		display: grid;
		grid-template-columns: auto 1fr auto;
	}
</style>
