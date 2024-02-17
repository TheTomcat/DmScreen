<script lang="ts">
	import RawStatblock from '$lib/components/new/EntityDisplay/RawStatblock.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { parseJSONToEntity, type Creature } from '$lib/jsonschema';
	import type { Entity } from '../../../../../app';
	import { Button } from '$lib/components/ui/button';
	import { fly, scale } from 'svelte/transition';
	import { ChevronRight, ChevronLeft } from 'lucide-svelte';
	import ScrollBox from '$lib/components/ScrollBox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { json } from '@sveltejs/kit';
	import type { ChangeEventHandler } from 'svelte/elements';

	/// https://5e.tools/makebrew.html

	let rawJSON: string = '';
	let entity: Entity | Omit<Entity, 'entity_id'> | undefined; //, 'entity_id'>;
	let entities: (Entity | undefined)[] | undefined;

	$: {
		try {
			let obj = JSON.parse(rawJSON);

			if (Array.isArray(obj)) {
				console.log('is array');
				entity = undefined;
				entities = obj.map((c) => {
					let newEntity = parseJSONToEntity(c);
					if (newEntity) {
						console.log(newEntity.name);
						let newentity = Object.assign(newEntity, { entity_id: 0 });
						return newentity;
					}
				});
			} else {
				let newEntity = parseJSONToEntity(obj);
				if (newEntity) {
					entity = Object.assign(newEntity, { entity_id: 0 });
					entities = undefined;
				}
			}
		} catch (e) {
			entity = undefined;
			entities = undefined;
			console.error(e);
		}
	}

	let visible: boolean = true;
	let currentVisibleEntity: number = 0;

	const incVis = () => {
		console.log(currentVisibleEntity);
		if (!entities) return;
		if (currentVisibleEntity < entities.length) {
			currentVisibleEntity += 1;
		} else {
			currentVisibleEntity = 0;
		}
	};
	const decVis = () => {
		if (!entities) return;
		if (currentVisibleEntity > 0) {
			currentVisibleEntity -= 1;
		} else {
			currentVisibleEntity = entities.length - 1;
		}
	};

	let scrollboxItems = ['Info', 'Species', 'Core', 'Defence', 'Abilities', 'Flavour'];
	let currentScroll = 'Info';
	let assistMode: boolean = true;

	const toggleInsertMode = () => {
		assistMode = !assistMode;
	};

	const skills: { skill: string; ability: string }[] = [
		{ skill: 'acrobatics', ability: 'dex' },
		{ skill: 'animal handling', ability: 'wis' },
		{ skill: 'arcana', ability: 'int' },
		{ skill: 'athletics', ability: 'str' },
		{ skill: 'deception', ability: 'cha' },
		{ skill: 'history', ability: 'int' },
		{ skill: 'insight', ability: 'wis' },
		{ skill: 'intimidation', ability: 'cha' },
		{ skill: 'investigation', ability: 'int' },
		{ skill: 'medicine', ability: 'wis' },
		{ skill: 'nature', ability: 'int' },
		{ skill: 'perception', ability: 'wis' },
		{ skill: 'performance', ability: 'cha' },
		{ skill: 'persuasion', ability: 'cha`' },
		{ skill: 'religion', ability: 'int' },
		{ skill: 'sleight of hand', ability: 'dex' },
		{ skill: 'stealth', ability: 'dex' },
		{ skill: 'survival', ability: 'wis' }
	];

	let creature: Creature = {
		name: '',
		ac: [0],
		alignment: ['N'],
		source: 'Homebrew',
		page: -1,
		size: 'M',
		type: 'monstrosity',
		hp: { formula: '1d6+3', average: 7 },
		cha: 10,
		con: 10,
		dex: 10,
		str: 10,
		int: 10,
		wis: 10,
		cr: '1/2',
		speed: {},
		passive: 0
	};

	import type { Skill, Speed, Stat } from '$lib/jsonschema';
	import { renderModifier } from '$lib';
	let surrogateSaves: { [stat in Stat]?: number } = {};

	const handleChange = (...keys: string[]): ChangeEventHandler<HTMLInputElement> => {
		switch (keys[0]) {
			case 'save':
				return (e: Event) => {
					if (!e || !e.target || !e.target) return;
					const target = e.target as HTMLInputElement;
					const stat = keys[1] as unknown as Stat;
					if (!creature.save) creature.save = {};
					if (target.value == '') {
						delete creature.save[stat];
					} else {
						let [displayText, modifier] = toFromModifier(target.value);
						creature.save[stat] = displayText;
						target.value = displayText;
					}
					if (isEmpty(creature.save)) delete creature.save;
					creature = creature;
				};

			case 'speed':
				return (e: Event) => {
					if (!e || !e.target || !e.target) return;
					const target = e.target as HTMLInputElement;
					const speed = keys[1] as unknown as Speed;
					if (!creature.speed) creature.speed = {};
					if (target.value == '') {
						delete creature.speed[speed];
					} else {
						creature.speed[speed] = parseInt(target.value);
					}
					// if (isEmpty(creature.speed)) delete creature.speed;
					creature = creature;
				};
			case 'skill':
				return (e: Event) => {
					if (!e || !e.target || !e.target) return;
					const target = e.target as HTMLInputElement;
					const skill = keys[1] as unknown as Skill;
					if (!creature.skill) creature.skill = {};
					if (target.value == '') {
						delete creature.skill[skill];
					} else {
						let [displayText, modifier] = toFromModifier(target.value);
						creature.skill[skill] = displayText;
						target.value = displayText;
					}
					if (isEmpty(creature.skill)) delete creature.skill;
					creature = creature;
				};
		}
		return (e: Event) => {
			if (!e || !e.target || !e.target) return;
		};
	};

	/**
	 * Take a raw input, attempt to convert it to an integer and return the integer as well
	 * as the 'rendered modifier'
	 * @param inp Raw user input, ideally of the form [+/-]digit
	 */
	const toFromModifier = (inp: string): [string, number] => {
		let displayText: string;
		let modifier: number;

		modifier = parseInt(inp);
		displayText = renderModifier(modifier);
		return [displayText, modifier];
	};

	const isEmpty = (obj: Object): boolean => {
		return Object.keys(obj).length === 0;
	};

	$: entity = parseJSONToEntity(creature);
</script>

<!-- 
<div class="h-[80vh]">
	<Button on:click={() => (visible = !visible)}>
		{#if visible}
			<h1>Parse</h1>
		{:else}
			<h1>Enter JSON Data</h1>
		{/if}
	</Button>

	{#if visible}
		<div transition:scale class="h-[70vh]">
			<Textarea bind:value={rawJSON} class="h-[70vh]" />
		</div>
	{:else if entity}
		<RawStatblock bind:entity />
	{:else if entities}
		{#if entities}
			{entities.map((e) => e?.name)}
		{/if}
		<div class="grid grid-cols-[auto_1fr_auto]">
			<Button on:click={decVis}><ChevronLeft /></Button>
			<div>
				<RawStatblock bind:entity={entities[currentVisibleEntity]} />
			</div>
			<Button on:click={incVis}><ChevronRight /></Button>
		</div>
	{/if}
</div> -->
<div class="flex flex-row justify-between">
	<ScrollBox items={scrollboxItems} bind:currentItem={currentScroll} />
	<Button on:click={toggleInsertMode}>{assistMode ? 'Assist' : 'Raw'}</Button>
</div>
{#if currentScroll == 'Info'}
	<div class="grid grid-cols-[auto_1fr]">
		<div>Name</div>
		<Input bind:value={creature.name} />
		<div>Source</div>
		<div class="flex flex-col">
			<Input placeholder="sourcebook" bind:value={creature.source} />
			<Input placeholder="page" bind:value={creature.page} />
		</div>
		<div>Alignment</div>
		<Input bind:value={creature.alignment} />
		<div>CR</div>
		<Input bind:value={creature.cr} />
	</div>
{:else if currentScroll == 'Species'}
	<div class="grid grid-cols-[auto_1fr]">
		<div>Size</div>
		<Input />
		<div>Type</div>
		<Input />
		<div>Speed</div>
		<div class="grid grid-cols-4">
			{#each ['Walk', 'Burrow', 'Climb', 'Fly', 'Swim'] as speedType}
				{speedType}
				<Input on:change={handleChange('speed', speedType.toLocaleLowerCase())} />
				ft.
				<Input placeholder="when" />
			{/each}
		</div>
		<div>Senses</div>
		<Input />
		<div>Languages</div>
		<Input />
	</div>
{:else if currentScroll == 'Core'}
	<div class="grid grid-cols-[auto_1fr]">
		<div>Ability Scores</div>
		<div class="grid grid-cols-6">
			<div>STR</div>
			<div>DEX</div>
			<div>CON</div>
			<div>INT</div>
			<div>WIS</div>
			<div>CHA</div>
			<Input bind:value={creature.str} />
			<Input bind:value={creature.dex} />
			<Input bind:value={creature.con} />
			<Input bind:value={creature.int} />
			<Input bind:value={creature.wis} />
			<Input bind:value={creature.cha} />
		</div>
		<div>Saving throws</div>
		<div class="grid grid-cols-6">
			<div>STR</div>
			<div>DEX</div>
			<div>CON</div>
			<div>INT</div>
			<div>WIS</div>
			<div>CHA</div>
			<Input on:change={handleChange('save', 'str')} />
			<Input on:change={handleChange('save', 'dex')} />
			<Input on:change={handleChange('save', 'con')} />
			<Input on:change={handleChange('save', 'int')} />
			<Input on:change={handleChange('save', 'wis')} />
			<Input on:change={handleChange('save', 'cha')} />
		</div>
		<div>Skills</div>
		<div class="grid grid-cols-5">
			{#each skills as { skill, ability }}
				<div>{skill}</div>
				<div>{ability}</div>
				<Input on:change={handleChange('skill', skill)} />
				<Button variant="outline" class="m-0 p-0 h-[unset]">Prof</Button>
				<Button variant="outline" class="m-0 p-0 h-[unset]">Expert</Button>
			{/each}
		</div>
		<div>Passive Perception</div>
		<Input />
	</div>
{:else if currentScroll == 'Defence'}
	<div class="grid grid-cols-[auto_1fr]">
		<div>Armor Class</div>
		<div class="grid grid-cols-2">
			<Input bind:value={creature.ac[0]} />
		</div>
		<div>Hit Points</div>
		<div class="grid grid-cols-[1fr_auto]">
			<Input />
			<Button />
		</div>
		<div>Damage Vulnerabilities</div>
		<div class="grid grid-cols-2">
			<Input />
		</div>
		<div>Damage Resistances</div>
		<div class="grid grid-cols-2">
			<Input />
		</div>
		<div>Damage Immunities</div>
		<div class="grid grid-cols-2">
			<Input />
		</div>
		<div>Condition Immunities</div>
		<div class="grid grid-cols-2">
			<Input />
		</div>
	</div>
{:else if currentScroll == 'Abilities'}{:else if currentScroll == 'Flavour'}{/if}
<div class="grid grid-cols-2">
	<RawStatblock bind:entity />
	{JSON.stringify(creature)}
</div>
