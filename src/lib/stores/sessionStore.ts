import { writable } from "svelte/store";
import type { components } from '$lib/api/v1';
import client from "$lib/api/index";

type Image = components['schemas']['ImageURL'];
type Combat = components['schemas']['Combat'];
type SessionEmptyId = components['schemas']['SessionEmptyId']
type SessionBackdropId = components['schemas']['SessionBackdropId']
type SessionLoadingId = components['schemas']['SessionLoadingId']
type SessionCombatId = components['schemas']['SessionCombatId']
type SessionHandoutId = components['schemas']['SessionHandoutId']
type SessionMapId = components['schemas']['SessionMapId']
export type Session = SessionEmptyId | SessionBackdropId | SessionLoadingId | SessionCombatId | SessionHandoutId | SessionMapId
type Participant = components['schemas']['Participant'];


export const sessionStore = writable<Session>();

export const refresh = (session_id: number) => {
    client.GET('/session/{session_id}', { params: { path: { session_id } } }).then((res) => {
        if (!res.data) return;
        sessionStore.set(res.data);
    })
}

export const setActiveParticipantID = (newActivePartcipantId: number) => {
    sessionStore.update((sessionStore) => {
        if (sessionStore.mode != 'combat') { console.error(`Invalid participant ID: ${newActivePartcipantId}`); return sessionStore; }
        return { ...sessionStore, combat: { ...sessionStore.combat, active_participant_id: newActivePartcipantId } }
    })
}

