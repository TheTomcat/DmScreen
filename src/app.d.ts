// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { components } from "$lib/api/v1";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: { username: string, name: string, role: string, fb: string, image: number }
		}
		// interface PageData {}
		// interface Platform {}
	}
}

// declare module 'simple-svelte-autocomplete';


export type RollMode = 'default' | 'random' | 'min' | 'max' | 'one';

type Image = components['schemas']['Image'];
type ImageURL = components['schemas']['ImageURL'];
type ImageType = components['schemas']['ImageType'];
type Message = components['schemas']['Message'];
type Tag = components['schemas']['Tag'];
type Entity = components['schemas']['Entity'];
type EntityByID = components['schemas']['EntityByID'];
type Participant = components['schemas']['Participant'];
type ParticipantUpdate = components['schemas']['ParticipantUpdate'];
type Combat = components['schemas']['Combat'];
type Session = components['schemas']['Session'];
type Collection = components['schemas']['Collection'];

export type _ImageMatch = {
	image: Image;
	image_id: number;
	matches: number;
	tags: string[];
}

export type ImageMatch = {
	tag_list: number[];
	images: _ImageMatch[];
}


export type InitiativeRoll = {
	participant_id: number;
	initiative: number;
}

export type Initiative = {
	combat_id: number;
	rolls: InitiativeRoll[];
}