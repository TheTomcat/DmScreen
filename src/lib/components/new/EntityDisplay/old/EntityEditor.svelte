<script lang="ts">
	import type { Entity } from '../../../../../app';
	import Counter from '../Counter.svelte';
	import EntityBlock from '../../EntityBlock.svelte';
	import {
		type Creature,
		sizes,
		type ListEntry,
		type ItemEntry,
		type ExtText
	} from '$lib/jsonschema';
	import { renderModifier, renderModifierFromAbilityScore } from '$lib';

	export let entity: Entity;
	let renderData: Creature;
	$: {
		console.log('onchange');
		if (entity) {
			renderData = entity.data as unknown as Creature;
		}
	}

	const renderSize = (c: Creature): string => {
		return sizes[c.size] || 'unknown';
	};

	const renderType = (c: Creature): string => {
		if (typeof c.type == 'string') {
			return c.type;
		}
		return c.type.type;
	};

	const renderActions = (c: Creature): string => {
		let s: string = '';
		if (!c.action) return s;
		for (let action of c.action) {
			s = s.concat(`<h5>${action.name}</h5>`);
			for (let entry of action.entries) {
				if (typeof entry == 'string') {
					s = s.concat(`<p>${entry}</p>`);
				} else {
					s = s.concat(renderListEntry(entry));
				}
			}
		}
		return s;
	};

	const renderListEntry = (l: ListEntry): string => {
		let styleStr: string = '';
		if (l?.style) {
			styleStr = ` class="${l.style}"`;
		}
		if (typeof l.items[0] == 'string') {
			return `<p${styleStr}>${l.items.join(`</p><p${styleStr}>`)}</p>`;
		}
		return `<p class="${styleStr}}">${(l.items as ItemEntry[]).map(renderItemEntry)}</p>`;
	};
	const renderItemEntry = (t: ItemEntry): string => {
		let styleStr: string = '';
		if (t?.style) {
			styleStr = ` class="${t.style}"`;
		}
		let entry: string = '';
		if (t?.entry) entry = t.entry;
		if (t?.entries) entry = t.entries.join('\n');
		return `<p${styleStr}><span class="itemname">${t.name}</span>${entry}</p>`;
	};
</script>

{#if !entity}
	No entity found
{:else}
	<div class="container">
		<div class="block">
			<h2>{entity.name}</h2>
			<span>{renderSize(renderData)} {renderType(renderData)}</span>
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
			<div><span>Str</span>{renderData.str} ({renderModifierFromAbilityScore(renderData.str)})</div>
			<div><span>Dex</span>{renderData.dex} ({renderModifierFromAbilityScore(renderData.dex)})</div>
			<div><span>Con</span>{renderData.con} ({renderModifierFromAbilityScore(renderData.con)})</div>
			<div><span>Int</span>{renderData.int} ({renderModifierFromAbilityScore(renderData.int)})</div>
			<div><span>Wis</span>{renderData.wis} ({renderModifierFromAbilityScore(renderData.wis)})</div>
			<div><span>Cha</span>{renderData.cha} ({renderModifierFromAbilityScore(renderData.cha)})</div>
		</div>
		<div class="block">
			{@html renderActions(renderData)}
			<h5>Saves</h5>
			<Counter title="Breath Weapon" total={5} numConsumed={3} />
		</div>
		<div class="block">
			{JSON.stringify(entity.data)}
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
