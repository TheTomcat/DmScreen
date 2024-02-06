<script lang="ts">
	import type { Entity, Participant } from '../../../../../app';
	import Counter from '../Counter.svelte';

	import {
		type Creature,
		renderSize,
		renderType,
		renderBlock,
		renderAC,
		renderHP,
		renderSpeed,
		renderCR,
		renderLanguages,
		renderSaves,
		renderSkills,
		renderSenses,
		renderVulnerabilities,
		renderResistances,
		renderImmunities,
		renderConditionImmunities,
		renderTraits,
		renderSpellcasting,
		renderActions,
		renderLegendaryActions,
		makeArray,
		makeMiniBlock,
		makeBlock
	} from '$lib/jsonschema';
	import { renderModifierFromAbilityScore } from '$lib';
	import { type CounterType, counters, createCounter } from '$lib/stores/counterStore';

	import InjectableHtmlTag from '../../InjectableHTMLTag.svelte';
	import CounterConsume from '../CounterConsume.svelte';

	export let entity: Entity;
	let participant: Participant = { participant_id: 1, combat_id: 1 } as Participant;

	let renderData: Creature;
	$: {
		console.log('onchange');
		if (entity) {
			renderData = entity.data as unknown as Creature;
			participant = { participant_id: entity.entity_id, combat_id: 1 } as Participant;
		}
	}
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
			{@html renderBlock(renderData, renderAC, makeArray('AC'))}
			{@html renderBlock(renderData, renderCR, makeArray('CR'))}
			{@html renderBlock(renderData, renderHP, makeArray('HP'))}
			{@html renderBlock(renderData, renderSpeed, makeArray('Speed'))}
			{@html renderBlock(renderData, renderLanguages, makeArray('Languages'))}
		</div>
		<div class="block stats">
			<div><span>Str</span>{renderData.str} ({renderModifierFromAbilityScore(renderData.str)})</div>
			<div><span>Dex</span>{renderData.dex} ({renderModifierFromAbilityScore(renderData.dex)})</div>
			<div><span>Con</span>{renderData.con} ({renderModifierFromAbilityScore(renderData.con)})</div>
			<div><span>Int</span>{renderData.int} ({renderModifierFromAbilityScore(renderData.int)})</div>
			<div><span>Wis</span>{renderData.wis} ({renderModifierFromAbilityScore(renderData.wis)})</div>
			<div><span>Cha</span>{renderData.cha} ({renderModifierFromAbilityScore(renderData.cha)})</div>
		</div>
		<hr />
		{@html renderBlock(renderData, renderSaves, makeMiniBlock('Saves'))}
		{@html renderBlock(renderData, renderSkills, makeMiniBlock('Skills'))}
		{@html renderBlock(renderData, renderSenses, makeMiniBlock('Senses'))}
		{@html renderBlock(renderData, renderVulnerabilities, makeMiniBlock('Damage Vulnerabilities'))}
		{@html renderBlock(renderData, renderResistances, makeMiniBlock('Damage Resistances'))}
		{@html renderBlock(renderData, renderImmunities, makeMiniBlock('Damage Immunities'))}
		{@html renderBlock(
			renderData,
			renderConditionImmunities,
			makeMiniBlock('Condition Immunities')
		)}
		{@html renderBlock(renderData, renderTraits, makeBlock('Traits'))}
		{@html renderBlock(renderData, renderSpellcasting, makeBlock('Spells'))}
		{@html renderBlock(renderData, renderActions, makeBlock('Actions'))}
		{@html renderBlock(
			renderData,
			renderLegendaryActions,
			makeBlock('Legendary Actions'),
			participant
		)}
		<InjectableHtmlTag
			html={renderBlock(renderData, renderLegendaryActions, makeBlock('Legendary Actions'))}
			rules={[
				{
					regex: RegExp(/\<\<([\w\-]+)(?::([\w\d]+))?\>\>/, 'g'),
					component: CounterConsume,
					props: {}
				}
			]}
		/>
		{#each $counters as counter}
			<Counter id={counter.id} />
			{JSON.stringify(counter)}
		{/each}
	</div>
{/if}

<style>
	.container :global(*) {
		max-inline-size: unset;
	}
	.container :global(hr) {
		margin-block: unset;
	}
	.container :global(.dc) {
		text-decoration: underline;
		text-decoration-style: dotted;
	}
	.container :global(.heading) {
		padding-right: var(--size-3);
	}
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}
	.stats {
		display: flex;
		flex-direction: row;
		gap: var(--size-3);
		justify-content: center;
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
