// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module 'simple-svelte-autocomplete';

export type ToDo = {
	text: string;
	completed: boolean;
	id: number;
};
export type ToDos = ToDo[];

export type RollMode = 'default' | 'random' | 'min' | 'max' | 'one';

export type Image = {
	image_id: number;
	filename: string;
	dimensions: [number, number];
	url: string;
	thumbnail: string
}

export type Message = {
	message_id: number;
	message: string
}

export type Session = {
	session_id: number;
	title: string;
	image_id: number;
	message_id: number;
}

export type _ImageMatch = {
	image_id: number;
	matches: number;
	tags: string[];
}

export type ImageMatch = {
	tag_list: number[];
	images: _ImageMatch[];
}

export type Tag = {
	tag_id: number;
	tag: string;
}

export type Entity = {
	entity_id: number;
	name: string;
	hit_dice: string;
	ac: number;
	cr: string;
	initiative_modifier: number;
	is_PC: boolean;
	image_id: number | null;
	source: string | null;
	source_page: number | null;
	data: string | null;
}

export type Participant = {
	participant_id: number;
	combat_id: number;
	entity_id: number | null;
	is_PC: boolean;
	name: string;
	is_visible: boolean;
	damage: number;
	max_hp: number;
	ac: number;
	initiative: number;
	initiative_modifier: number;
	conditions: string[];
	has_reaction: boolean;
	colour: string | null;
	image_id: number | null;
}

export type Combat = {
	combat_id: number;
	title: string;
	participants: Participant[];
	//participants: { [participant_id: number]: Participant; };
}

export type InitiativeRoll = {
	participant_id: number;
	initiative: number;
}

export type Initiative = {
	combat_id: number;
	rolls: InitiativeRoll[];
}

export type Response<T> = {
	response: "OK";
	payload: T;
}

export type Fail = {
	response: "Fail";
	error_code: number;
	error_message: string;
}

export type ApiResponse<T> = Response<T> | Fail;


declare type Item = import("svelte-dnd-action").Item;
declare type DndEvent<ItemType = Item> = import("svelte-dnd-action").DndEvent<ItemType>;
declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		"on:consider"?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
		"on:finalize"?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
	}
}