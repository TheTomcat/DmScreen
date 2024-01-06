<script lang="ts">
	import type { Entity, Participant } from '../../../../app';
	import Counter from './../Counter.svelte';

	import {
		type Creature,
		renderSize,
		renderType,
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
		renderConditionImmunities
	} from '$lib/jsonschema';
	import { renderModifierFromAbilityScore } from '$lib';
	import {
		type CounterType,
		counters,
		createCounter,
		makeCounterID,
		consumeByParticipant
	} from '$lib/stores/counterStore';

	import Spellcasting from './Spellcasting.svelte';
	import Actions from './Actions.svelte';

	export let entity: Entity;
	export let participant: Participant; //= { participant_id: 1, combat_id: 1 } as Participant;

	let renderData: Creature;
	$: {
		console.log('onchange');
		if (entity) {
			renderData = entity.data as unknown as Creature;
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
			<div class="heading ac">AC</div>
			<div class="content ac">{renderAC(renderData)}</div>
			<div class="heading cr">CR</div>
			<div class="content cr">{renderCR(renderData)}</div>
			<div class="heading hp">HP</div>
			<div class="content hp">{renderHP(renderData)}</div>
			<div class="heading speed">Speed</div>
			<div class="content speed">{renderSpeed(renderData)}</div>
			<div class="heading languages">Languages</div>
			<div class="content languages">{renderLanguages(renderData)}</div>
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
		{#if renderData.saves}
			<span><b>Saves:</b> {renderSaves(renderData)}</span>
		{/if}
		{#if renderData.skill}
			<span><b>Skills:</b> {renderSkills(renderData)}</span>
		{/if}
		{#if renderData.senses}
			<span><b>Senses:</b> {renderSenses(renderData)}</span>
		{/if}
		{#if renderData.vulnerable}
			<span><b>Damage Vulnerabilities:</b> {renderVulnerabilities(renderData)}</span>
		{/if}
		{#if renderData.resist}
			<span><b>Damage Resistances:</b> {renderResistances(renderData)}</span>
		{/if}
		{#if renderData.immune}
			<span><b>Damage Immunities:</b> {renderImmunities(renderData)}</span>
		{/if}
		{#if renderData.conditionImmune}
			<span><b>Condition Immunities:</b> {renderConditionImmunities(renderData)}</span>
		{/if}
		{#if renderData.trait}
			<hr />
			<h5>Traits</h5>
			<Actions actions={renderData.trait} {participant} />
		{/if}
		{#if renderData.spellcasting}
			<hr />
			<h5>Spellcasting</h5>
			<Spellcasting spellcastings={renderData.spellcasting} {participant} />
		{/if}
		{#if renderData.action}
			<hr />
			<h5>Actions</h5>
			<Actions actions={renderData.action} {participant} />
		{/if}
		{#if renderData.legendary}
			<hr />
			<h5 style="display: flex; align-items: center;">
				{#if participant}
					Legendary Actions (
					<Counter id={makeCounterID(participant, 'legendary-actions')} abbreviated={true} />
					/Round)
					<button
						on:click={() => {
							consumeByParticipant(participant, 'legendary-actions');
						}}
					>
						Reset
					</button>
				{:else}
					Legendary Actions (3/Round)
				{/if}
			</h5>
			<Actions actions={renderData.legendary} {participant} legendary={true} />
		{/if}
		<!-- {#each $counters as counter}
			<Counter id={counter.id} />
			{JSON.stringify(counter)}
		{/each} -->
	</div>
{/if}

<style>
	.container :global(*) {
		max-inline-size: unset;
	}
	hr {
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
	button.naked {
		padding: unset;
		border: unset;
	}
</style>
