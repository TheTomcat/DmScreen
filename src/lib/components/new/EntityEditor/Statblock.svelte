<script lang="ts">
	import type { Entity, ImageURL, Participant } from '../../../../app';
	import Counter from './Counter.svelte';

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
		consumeByParticipant,
		resetByParticipant,
		findCounter,
		isFull
	} from '$lib/stores/counterStore';

	import Spellcasting from './Spellcasting.svelte';
	import Actions from './Actions.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import TextBlock from './TextBlock.svelte';
	import client from '$lib/api/index';
	import SkillDialog from './SkillDialog.svelte';

	export let entity: Entity;
	export let participant: Participant | undefined = undefined; //= { participant_id: 1, combat_id: 1 } as Participant;
	export let dialogOpen: boolean = false;

	// let image: ImageURL | undefined;
	// const getImage = (image_id: number) => {
	// 	client.GET('/image/{image_id}', { params: { path: { image_id } } }).then((response) => {
	// 		if (!response || !response.data) return;
	// 		image = response.data;
	// 	});
	// };

	let renderData: Creature;
	$: {
		if (entity) {
			renderData = JSON.parse(entity.data as string) as unknown as Creature;
		}
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title
			>{#if entity}{entity.name}{:else}No Entity Found{/if}</Card.Title
		>
		<Card.Description
			>{#if entity}
				{renderSize(renderData)}
				{renderType(renderData)}
			{:else}
				No Entity Found
			{/if}</Card.Description
		>
	</Card.Header>
	<Card.Content>
		{#if renderData && renderData.skill}
			<SkillDialog skills={renderData.skill} />
		{/if}
		{#if !entity || !renderData}
			No entity found
		{:else}
			<div class="container overflow-scroll">
				<div class="grid grid-cols-2">
					<!-- <h2 class="text-xl">{entity.name}</h2> -->
					<!-- <span>{renderSize(renderData)} {renderType(renderData)}</span> -->
					<div class="grid grid-cols-[auto,1fr] gap-2 my-3">
						<div class="heading image">Image:</div>
						<div class="content image">{entity.image_id}</div>
						<div class="heading source">Source:</div>
						<div class="content source">{entity.source}, pg {entity.source_page}</div>
						<div class="heading ac">AC</div>
						<div class="content ac"><TextBlock text={renderAC(renderData)} /></div>
						<div class="heading cr">CR</div>
						<div class="content cr">{renderCR(renderData)}</div>
						<div class="heading hp">HP</div>
						<div class="content hp">{renderHP(renderData)}</div>
						<div class="heading speed">Speed</div>
						<div class="content speed">{renderSpeed(renderData)}</div>
						<div class="heading languages">Languages</div>
						<div class="content languages">{renderLanguages(renderData)}</div>
					</div>
					<!-- <div class="object-cover max-h-[200px] flex justify-end">
						{#if image}
							<img
								class="portrait object-scale-down"
								src={`/api/${image.thumbnail_url}?height=200`}
								alt={image.name}
							/>
						{/if}
					</div> -->
				</div>
				<hr />
				<div class="flex flex-row gap-3 justify-center my-3">
					<div class="flex flex-col items-center">
						<span class="font-bold text-sm">Str</span>
						{renderData.str} ({renderModifierFromAbilityScore(renderData.str)})
					</div>
					<div class="flex flex-col items-center">
						<span class="font-bold text-sm">Dex</span>
						{renderData.dex} ({renderModifierFromAbilityScore(renderData.dex)})
					</div>
					<div class="flex flex-col items-center">
						<span class="font-bold text-sm">Con</span>
						{renderData.con} ({renderModifierFromAbilityScore(renderData.con)})
					</div>
					<div class="flex flex-col items-center">
						<span class="font-bold text-sm">Int</span>
						{renderData.int} ({renderModifierFromAbilityScore(renderData.int)})
					</div>
					<div class="flex flex-col items-center">
						<span class="font-bold text-sm">Wis</span>
						{renderData.wis} ({renderModifierFromAbilityScore(renderData.wis)})
					</div>
					<div class="flex flex-col items-center">
						<span class="font-bold text-sm">Cha</span>
						{renderData.cha} ({renderModifierFromAbilityScore(renderData.cha)})
					</div>
				</div>
				<hr />
				<div class="grid grid-cols-[auto_1fr] gap-x-2">
					<!-- flex flex-col my-3 -->
					{#if renderData.saves}
						<span class="font-bold">Saves:</span>
						<span>{renderSaves(renderData)}</span>
					{/if}
					{#if renderData.skill}
						<span class="font-bold">Skills:</span>
						<span>{renderSkills(renderData)}</span>
					{/if}
					{#if renderData.senses}
						<span class="font-bold">Senses:</span>
						<span>{renderSenses(renderData)}</span>
					{/if}
					{#if renderData.vulnerable}
						<span class="font-bold">Damage Vulnerabilities:</span>
						<span>{renderVulnerabilities(renderData)}</span>
					{/if}
					{#if renderData.resist}
						<span class="font-bold">Damage Resistances:</span>
						<span>{renderResistances(renderData)}</span>
					{/if}
					{#if renderData.immune}
						<span class="font-bold">Damage Immunities:</span>
						<span>{renderImmunities(renderData)}</span>
					{/if}
					{#if renderData.conditionImmune}
						<span class="font-bold">Condition Immunities:</span>
						<span>{renderConditionImmunities(renderData)}</span>
					{/if}
				</div>
				{#if renderData.trait}
					<div class="flex flex-col my-3">
						<hr />
						<h2 class="text-xl font-bold">Traits</h2>
						<Actions actions={renderData.trait} />
					</div>
				{/if}
				{#if renderData.spellcasting}
					<div class="flex flex-col my-3">
						<hr />
						<h2 class="text-xl font-bold">Spellcasting</h2>
						<Spellcasting spellcastings={renderData.spellcasting} />
					</div>
				{/if}
				{#if renderData.action}
					<div class="flex flex-col my-3">
						<hr />
						<h2 class="text-xl font-bold">Actions</h2>
						<Actions actions={renderData.action} />
					</div>
				{/if}
				{#if renderData.legendary}
					<div class="flex flex-col my-3">
						<hr />
						<h2 class="text-xl font-bold flex items-center">
							{#if participant}
								Legendary Actions (
								<Counter id={makeCounterID(participant, 'legendary-actions')} abbreviated={true} />
								/Round)
								<Button
									disabled={isFull($counters.find(findCounter(participant, 'legendary-actions')))}
									class="h-[unset] px-2 py-1 m-1"
									on:click={() => {
										if (!participant) return;
										resetByParticipant(participant, 'legendary-actions');
									}}
								>
									Reset
								</Button>
							{:else}
								Legendary Actions (3/Round)
							{/if}
						</h2>
						<Actions actions={renderData.legendary} />
					</div>
				{/if}
				{#if renderData.mythic}
					<div class="flex flex-col my-3">
						<hr />
						<h2 class="text-xl font-bold flex items-center">
							{#if participant}
								Mythic Actions (
								<Counter id={makeCounterID(participant, 'legendary-actions')} abbreviated={true} />
								/Round)
								<Button
									disabled={isFull($counters.find(findCounter(participant, 'legendary-actions')))}
									class="h-[unset] px-2 py-1 m-1"
									on:click={() => {
										if (!participant) return;
										resetByParticipant(participant, 'legendary-actions');
									}}
								>
									Reset
								</Button>
							{:else}
								Mythic Actions
							{/if}
						</h2>
						{#if renderData.mythicHeader}
							{#each renderData.mythicHeader as str}
								<p>{str}</p>
							{/each}
						{/if}
						<Actions actions={renderData.mythic} />
					</div>
				{/if}
			</div>
		{/if}
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<Button variant="outline">Cancel</Button>
		<Button>Deploy</Button>
	</Card.Footer>
</Card.Root>

<style>
	hr {
		margin-block: unset;
	}
	.container :global(.dc) {
		text-decoration: underline;
		text-decoration-style: dotted;
	}
</style>
