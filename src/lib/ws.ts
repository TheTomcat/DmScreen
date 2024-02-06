import type { Combat, Entity, Participant, Collection, ParticipantUpdate, ImageURL } from "../app";
import { writable, type Writable, derived, get } from "svelte/store";
import { persisted } from 'svelte-persisted-store';
import client from "$lib/api/index";
import { roll, rollDice } from "$lib";
import { entityHasData } from "./jsonschema";

let annoucementTimerId: number;

type wsEventHandler = (e: MessageEvent<string>) => void

// type wsEventType = "changeMode"
//     | "beginCombat"
//     | "showCombat"
//     | "updateCombat"
//     | "advanceCombat"
//     | "suspendCombat"
//     | "setBackgroundImage"
//     | "setLoadingMessage"
//     | "announce"
//     | "clearAnnouncement"
//     | "showSpinner"
//     | "provideStatus"
//     | "requestStatus"
//     | "notifyBackgroundImage"
//     | "notifyMessage"
//     | "setHandout"

export type wsPlayerMode = "loading" | "backdrop" | "combat" | "handout" | "map" | "idle";
export type wsImageData = number | Collection | ImageURL; //number[] | 
type wsEventChangeMode = {
    event: 'changeMode'
    mode: wsPlayerMode
}
type wsEventBeginCombat = {
    event: 'beginCombat'
    combat: Combat
}
type wsEventShowCombat = {
    event: 'showCombat'
    display: boolean
}
type wsEventUpdateCombat = {
    event: 'updateCombat'
    combat: Combat
}
type wsEventAdvanceCombat = {
    event: 'advanceCombat'
    next_participant_id: number
    have_looped: boolean
}
type wsEventSuspendCombat = {
    event: 'suspendCombat'
}
type wsEventSetBackgroundImage = {
    event: 'setBackgroundImage'
    data: wsImageData | undefined
    display: boolean
    image_id: number | undefined
    timeout: number | undefined
    cycle: boolean
}
type wsEventSetLoadingMessage = {
    event: 'setLoadingMessage'
    display: boolean
    message_id: number | undefined
    timeout: number | undefined
    cycle: boolean
}
type wsEventAnnounce = {
    event: 'announce' | 'clearAnnouncement'
    message: string
    timeout: number
    display: boolean
}
type wsEventClearAnnouncement = {
    event: 'clearAnnouncement'
}
type wsEventSetHandout = {
    event: 'setHandout'
    display: boolean
    handout_id: number | undefined;
}
type wsEventShowSpinner = {
    event: 'showSpinner'
    display: boolean
}
type wsEventRequestStatus = {
    event: 'requestStatus'
}
type wsEventProvideStatus = {
    event: 'provideStatus'
    state: playerState
}
type wsEventNotifyBackgroundImage = {
    event: 'notifyBackgroundImage'
    image_id: number;
}
type wsEventNotifyMessage = {
    event: 'notifyMessage'
    message_id: number;
}
type wsEventSetMap = {
    event: 'setMap'
    display: boolean
    map_id: number | undefined;
    map_data: MapData | undefined;
}
type wsEventPushState = {
    event: 'pushState'
    state: playerState
}

// type event = {
//     event: wsEventType
// }

// type Omit<T, event extends keyof T> = Pick<T, Exclude<keyof T, event>>

export type playerState = {
    mode: wsPlayerMode
    combat: Combat | undefined
    combat_display: boolean
    background_image_id: number | undefined
    background_image_data: wsImageData | undefined
    background_image_timeout: number
    background_image_display: boolean
    background_image_cycle: boolean
    spinner_display: boolean
    message_id: number | undefined
    message_timeout: number
    message_display: boolean
    message_cycle: boolean
    announce_text: string | undefined
    announce_timeout: number
    announce_display: boolean
    handout_display: boolean
    handout_image_id: number | undefined;
    map_display: boolean
    map_image_id: number | undefined;
    map_data: MapData | undefined;
}

export type MapData = {
    x: number,
    y: number,
    scale: number,
    transition: number
}

export type wsEvent = wsEventChangeMode
    | wsEventBeginCombat
    | wsEventShowCombat
    | wsEventUpdateCombat
    | wsEventAdvanceCombat
    | wsEventSuspendCombat
    | wsEventSetBackgroundImage
    | wsEventSetLoadingMessage
    | wsEventAnnounce
    | wsEventClearAnnouncement
    | wsEventShowSpinner
    // | wsEventSetBackgroundImageCycle
    | wsEventProvideStatus
    | wsEventRequestStatus
    | wsEventNotifyBackgroundImage
    | wsEventNotifyMessage
    | wsEventSetHandout
    | wsEventSetMap
    | wsEventPushState;

const initialValue: playerState = {
    mode: 'backdrop',
    combat: undefined,
    combat_display: false,
    background_image_id: undefined,
    background_image_data: undefined,
    background_image_timeout: 30000,
    background_image_display: true,
    background_image_cycle: true,
    spinner_display: false,
    message_id: undefined,
    message_display: false,
    message_cycle: true,
    message_timeout: 30000,
    announce_text: undefined,
    announce_timeout: 10000,
    announce_display: false,
    handout_display: false,
    handout_image_id: undefined,
    map_display: false,
    map_data: undefined,
    map_image_id: undefined
}

export const playerStateStore = writable<playerState>(initialValue);
export const combat = derived(playerStateStore, ($playerStateStore) => {
    if ($playerStateStore && $playerStateStore.combat)
        return $playerStateStore.combat;
    return undefined
});
export const activeParticipant = derived(playerStateStore, ($playerStateStore) => {
    if ($playerStateStore && $playerStateStore.combat)
        return $playerStateStore.combat.participants.find(p => p.participant_id == $playerStateStore.combat?.active_participant_id);
    return undefined
})



export const initialise = () => {
    playerStateStore.set(initialValue)
}

export const handleMessageEvent = (e: MessageEvent<string>, isClient: boolean) => { //) => {
    handleWSEvent(JSON.parse(e.data) as wsEvent, isClient) //)
}
/**
 * This is the handler function for both the client and the controller,
 * which takes a wsEvent as the parameter then updates the store. This happens
 * on both the client (upon recieving the message) and the controller (after sending)
 * @param e wsEvent
 */
const handleWSEvent = (e: wsEvent, isClient: boolean = false) => { //) => {
    switch (e.event) {
        case 'changeMode':
            playerStateStore.update(makeChangeMode(e))
            break;
        case "showCombat":
            playerStateStore.update(makeShowCombat(e));
            break;
        case "beginCombat":
            playerStateStore.update(makeBeginCombat(e))
            break;
        case "updateCombat":
            playerStateStore.update(makeUpdateCombat(e))
            break;
        case "advanceCombat":
            playerStateStore.update(makeAdvanceCombat(e))
            break;
        case "suspendCombat":
            playerStateStore.update(makeSuspendCombat())
            break;
        case "setBackgroundImage":
            playerStateStore.update(makeSetBackgroundImage(e))
            break;
        case "notifyBackgroundImage":
            if (isClient) return
            playerStateStore.update(makeNotifyBackgroundImage(e))
            break;
        case "notifyMessage":
            // if (isClient) return
            playerStateStore.update(makeNotifyMessage(e))
            break;
        case "showSpinner":
            playerStateStore.update(makeShowSpinner(e))
            break;
        case "setLoadingMessage":
            playerStateStore.update(makeSetLoadingMessage(e))
            break;
        case "setHandout":
            playerStateStore.update(makeSetHandout(e));
            break;
        case "requestStatus":
            // playerStateStore.update(makeSetLoadingMessage(e))
            break;
        case "provideStatus":
            playerStateStore.set(e.state);
            break;
        case "announce":
            playerStateStore.update(makeAnnounce(e))
            // clearInterval(annoucementTimerId);
            // if (e.timeout > 0) {
            //     console.log(`scheduling update for ${e.timeout}`)
            //     annoucementTimerId = setInterval(() => playerStateStore.update(clearAnnounce), e.timeout)
            // }
            break;
        case "clearAnnouncement":
            playerStateStore.update(clearAnnounce);
            break;
        case "setMap":
            playerStateStore.update(makeSetMap(e))
            break;
        case "pushState":
            playerStateStore.set(e.state)
            break
        default:
            console.error("Unrecognised event", e)
    }
}


// These functions are all partial functions to simplify the handleWSEvent function
const makeSetLoadingMessage = (data: wsEventSetLoadingMessage) => {
    let setLoadingMessage = (playerState: playerState): playerState => {
        return {
            ...playerState,
            message_id: data.message_id,
            message_display: data.display,
            message_cycle: data.cycle,
            message_timeout: data.timeout || 30000
        }
    }
    return setLoadingMessage
}
const makeSetBackgroundImage = (data: wsEventSetBackgroundImage) => {
    let setBackgroundImage = (playerState: playerState): playerState => {
        return {
            ...playerState,
            background_image_id: data.image_id,
            background_image_data: data.data,
            background_image_display: data.display,
            background_image_timeout: data.timeout || 30000,
            background_image_cycle: data.cycle,
        }
    }
    return setBackgroundImage
}
const makeShowCombat = (data: wsEventShowCombat) => {
    let showCombat = (playerState: playerState): playerState => {
        return {
            ...playerState,
            combat_display: data.display
        }
    }
    return showCombat
}
const makeNotifyBackgroundImage = (data: wsEventNotifyBackgroundImage) => {
    let notifyBackgroundImage = (playerState: playerState): playerState => {
        return {
            ...playerState,
            background_image_id: data.image_id
        }
    }
    return notifyBackgroundImage
}
const makeNotifyMessage = (data: wsEventNotifyMessage) => {
    let notifyBackgroundImage = (playerState: playerState): playerState => {
        return {
            ...playerState,
            message_id: data.message_id
        }
    }
    return notifyBackgroundImage
}
const makeShowSpinner = (data: wsEventShowSpinner) => {
    let showSpinner = (playerState: playerState): playerState => {
        return {
            ...playerState,
            spinner_display: data.display
        }
    }
    return showSpinner
}
const makeSetHandout = (data: wsEventSetHandout) => {
    let setHandout = (playerState: playerState): playerState => {
        return {
            ...playerState,
            handout_display: data.display,
            handout_image_id: data.handout_id
        }
    }
    return setHandout
}
// const makeSetBackgroundImageCycle = (data: wsEventSetBackgroundImageCycle) => {
//     let setBackgroundImageCycle = (playerState: playerState): playerState => {
//         return {
//             ...playerState, background_image_cycle: data.cycle
//         }
//     }
//     return setBackgroundImageCycle
// }
const makeChangeMode = (data: wsEventChangeMode) => {
    let changeMode = (playerState: playerState): playerState => {
        return {
            ...playerState, mode: data.mode
        }
    }
    return changeMode
}
const makeAnnounce = (data: wsEventAnnounce) => {
    let announce = (playerState: playerState): playerState => {
        return {
            ...playerState, announce_text: data.message, announce_timeout: data.timeout, announce_display: true
        }
    }
    return announce
}
export const clearAnnounce = (playerState: playerState): playerState => {
    return {
        ...playerState, announce_display: false //announce_text: undefined, announce_timeout: 10000
    }
}
const makeBeginCombat = (data: wsEventBeginCombat | wsEventUpdateCombat) => {
    let setCombat = (playerState: playerState): playerState => {
        return {
            ...playerState, combat: { ...data.combat, is_active: true, round: 1 }, combat_display: true
        }
    }
    return setCombat
}
const makeUpdateCombat = (data: wsEventBeginCombat | wsEventUpdateCombat) => {
    let setCombat = (playerState: playerState): playerState => {
        return {
            ...playerState, combat: data.combat
        }
    }
    return setCombat
}
const makeAdvanceCombat = (data: wsEventAdvanceCombat) => {
    let advanceCombat = (playerState: playerState): playerState => {
        let active_participant = playerState.combat?.participants.find(p => p.participant_id == data.next_participant_id);
        if (!playerState.combat) return playerState
        if (!active_participant) {
            console.error('Invalid active_participant')
            return playerState
        }
        active_participant.has_reaction = true;
        return {
            ...playerState, combat: {
                ...playerState.combat,
                active_participant_id: data.next_participant_id,
                round: playerState.combat.round + (data.have_looped ? 1 : 0),
                participants: [
                    ...playerState.combat.participants.filter(p => p.participant_id != active_participant?.participant_id),
                    active_participant
                    // ...playerState.combat.participants.slice(0, active_participant_index),
                    // { ...playerState.combat.participants[active_participant_index], has_reaction: true },
                    // ...playerState.combat.participants.slice(active_participant_index + 1)
                ]

            } //as Combat
        }
    }
    return advanceCombat
}
const makeSuspendCombat = () => {
    let suspendCombat = (playerState: playerState): playerState => {
        delete playerState.combat;
        return { ...playerState, combat_display: false };
    }
    return suspendCombat
}
const makeSetMap = (data: wsEventSetMap) => {
    let setMap = (playerState: playerState): playerState => {
        return {
            ...playerState,
            map_display: data.display,
            map_image_id: data.map_id,
            map_data: data.map_data
        }
    }
    return setMap
}



// TODO: Implement provideStatus and requestStatus
const makeProvideStatus = (data: wsEventProvideStatus) => {
    let provideStatus = (playerState: playerState): playerState => {
        return {
            ...data.state
        }
    }
    return provideStatus
}

//////////////////////// Controller

export const connect = (endpoint: string, wsEventHandler: wsEventHandler | undefined = undefined) => {
    let ws: WebSocket;
    let path = new URL(`${endpoint}`, window.location.toString());
    path.protocol = 'ws:';
    ws = new WebSocket(path);
    if (wsEventHandler) {
        ws.addEventListener('message', wsEventHandler);
    }
    return ws;
};

export class wsReciever {
    ws: WebSocket;
    attempts: number = 0;
    constructor(endpoint: string) {
        this.ws = connect(endpoint, (e) => { console.log(e); handleMessageEvent(e, true) }); //*/ handleEvent);
        this.ws.onclose = this.handleDisconnect;
    }
    handleDisconnect() {
        console.log("Disconnected")
    }
    close() {
        this.ws.close();
    }
    // This is not fully implemented yet.
    // provideStatus(playerState: playerState) {
    //     let event: wsEventProvideStatus = {
    //         event: 'provideStatus',
    //         state: playerState
    //     }
    //     this.ws.send(JSON.stringify(event))
    // }
    notifyBackgroundImage({ ...e }: Omit<wsEventNotifyBackgroundImage, 'event'>) {
        let event: wsEventNotifyBackgroundImage = { ...e, event: 'notifyBackgroundImage' }
        this.ws.send(JSON.stringify(event))
    }
    notifyMessage({ ...e }: Omit<wsEventNotifyMessage, 'event'>) {
        let event: wsEventNotifyMessage = { ...e, event: 'notifyMessage' }
        this.ws.send(JSON.stringify(event))
    }
    provideStatus(state: playerState) {
        let event: wsEventProvideStatus = { event: 'provideStatus', state }
        this.ws.send(JSON.stringify(event))
    }
}



export class wsController {
    ws: WebSocket;
    constructor(endpoint: string) {
        this.ws = connect(endpoint, (e) => { console.log(e); handleMessageEvent(e, false) });
    }
    close() {
        this.ws.close();
    }

    setLoadingMessage({ ...e }: Omit<wsEventSetLoadingMessage, 'event'>) {
        let event: wsEventSetLoadingMessage = { ...e, event: 'setLoadingMessage' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    setBackgroundImage({ ...e }: Omit<wsEventSetBackgroundImage, 'event'>) {
        let event: wsEventSetBackgroundImage = { ...e, event: 'setBackgroundImage' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)

    }
    showCombat({ ...e }: Omit<wsEventShowCombat, 'event'>) {
        let event: wsEventShowCombat = { ...e, event: 'showCombat' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    showSpinner({ ...e }: Omit<wsEventShowSpinner, 'event'>) {
        let event: wsEventShowSpinner = { ...e, event: 'showSpinner' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    // setBackgroundImageCycle({ ...e }: Omit<wsEventSetBackgroundImageCycle, 'event'>) {
    //     let event: wsEventSetBackgroundImageCycle = { ...e, event: 'setBackgroundImageCycle' }
    //     this.ws.send(JSON.stringify(event))
    //     handleWSEvent(event)
    // }
    changeMode({ ...e }: Omit<wsEventChangeMode, 'event'>) {
        let event: wsEventChangeMode = { ...e, event: 'changeMode' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    announce({ ...e }: Omit<wsEventAnnounce, 'event'>) {
        let event: wsEventAnnounce = { ...e, event: 'announce' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    setHandout({ ...e }: Omit<wsEventSetHandout, 'event'>) {
        let event: wsEventSetHandout = { ...e, event: 'setHandout' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event);
    }
    clearAnnouncement() {
        let event: wsEventClearAnnouncement = { event: 'clearAnnouncement' };
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    beginCombat({ ...e }: Omit<wsEventBeginCombat, 'event'>) {
        let event: wsEventBeginCombat = { ...e, event: 'beginCombat' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    updateCombat({ ...e }: Omit<wsEventUpdateCombat, 'event'>) {
        let event: wsEventUpdateCombat = { ...e, event: 'updateCombat' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    advanceCombat({ ...e }: Omit<wsEventAdvanceCombat, 'event'>) {
        let event: wsEventAdvanceCombat = { ...e, event: 'advanceCombat' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    suspendCombat() {
        let event: wsEventSuspendCombat = { event: 'suspendCombat' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event);
    }
    setMap({ ...e }: Omit<wsEventSetMap, 'event'>) {
        let event: wsEventSetMap = { ...e, event: 'setMap' }
        this.ws.send(JSON.stringify(event))
        handleWSEvent(event)
    }
    pushState({ ...e }: Omit<wsEventPushState, 'event'>) {
        let event: wsEventPushState = { ...e, event: 'pushState' }
        this.ws.send(JSON.stringify(event))
        //DO NOT HANDLE WS EVENT HERE - INFINITE LOOP
    }

    requestStatus() {
        let event: wsEventRequestStatus = { event: 'requestStatus' }
        this.ws.send(JSON.stringify(event))
    }
    //////////COMBAT METHODS
    //////////These differ from the above messages, as the store manipulation is done
    ////////// on the "controller" side, and the completed combat object is sent en bloc
    ////////// to the client. Be sure to call updateCombat afterwards, as this is not automatic. 

    async updateParticipant(participant_id: number, updated_participant: ParticipantUpdate) {
        // @ts-ignore This is because of a hack that I implemented in the backend, where data is sometimes present and sometimes not.
        // Ideally, when this function is called, participant.data should not be present. 
        delete updated_participant?.data;
        let response = await client.PATCH('/participant/{participant_id}', {
            params: { path: { participant_id } },
            body: { ...updated_participant }
        })
        if (response.error) {
            return;
        }
        playerStateStore.update((playerState) => {
            // let index = newCombat.participants.findIndex(p => p.participant_id == updated_participant.participant_id);
            if (response.data && playerState.combat)
                return {
                    ...playerState,
                    combat: {
                        ...playerState.combat,
                        participants: [
                            ...(playerState.combat.participants.filter(p => p.participant_id != participant_id) || []),
                            response.data
                        ]
                    }
                }
            return playerState
        })
    }

    /**
     * 
     * @param combat_id 
     * @param participants list of partial participants, only supports initiative and hp at this point.
     */
    async updateParticipants(combat_id: number, participants: { participant_id: number, initiative: number | undefined, initiative_modifier: number | undefined, max_hp: number | undefined, damage: number | undefined }[]) {
        let response = await client.PATCH('/combat/{combat_id}',
            {
                params: {
                    path: { combat_id },
                },
                body: {
                    participants: participants.map(p => {
                        return {
                            participant_id: p.participant_id,
                            initiative: p.initiative,
                            initiative_modifier: p.initiative_modifier,
                            max_hp: p.max_hp,
                            damage: p.damage
                        }
                    })
                }

            })
        playerStateStore.update((playerState) => {
            // let index = newCombat.participants.findIndex(p => p.participant_id == updated_participant.participant_id);
            if (response.data && response.data.participants && playerState.combat) {
                let updated_participants = response.data.participants;
                // console.log({
                //     ...playerState,
                //     combat: {
                //         ...playerState.combat,
                //         participants: [
                //             ...(playerState.combat.participants.filter(p => !updated_participants.find(up => p.participant_id == up.participant_id)) || []),
                //             ...(playerState.combat.participants.filter(p => updated_participants.find(up => p.participant_id == up.participant_id)) || []).map(p => {
                //                 return {
                //                     ...p,
                //                     ...updated_participants.find(up => p.participant_id === up.participant_id)
                //                 }
                //             }),

                //         ]
                //     }
                // })
                return {
                    ...playerState,
                    combat: {
                        ...playerState.combat,
                        participants: [
                            ...(playerState.combat.participants.filter(p => !updated_participants.find(up => p.participant_id == up.participant_id)) || []),
                            ...(playerState.combat.participants.filter(p => updated_participants.find(up => p.participant_id == up.participant_id)) || []).map(p => {
                                return {
                                    ...p,
                                    ...updated_participants.find(up => p.participant_id === up.participant_id)
                                }
                            }),

                        ]
                    }
                }
            }
            return playerState
        })
    }

    async addParticipantFromEntity(combat_id: number, entity: Entity) {
        let response = await client.PATCH('/combat/{combat_id}/add', {
            params: {
                path: { combat_id },
            },
            body:
                [{
                    name: entity.name || "New Entity",
                    entity_id: entity.entity_id,
                    ac: entity.ac || 10,
                    hit_dice: entity.hit_dice || '',
                    max_hp: roll(entity.hit_dice, 'default'),
                    is_PC: entity.is_PC || false,
                    damage: 0,
                    initiative: rollDice(20, entity.initiative_modifier || 0),
                    has_reaction: true,
                    is_visible: false,
                    image_id: entity.image_id
                }]
        })
        if (!response) return;
        playerStateStore.update(playerState => {
            if (response.data && response.data.participants && playerState.combat) {
                return {
                    ...playerState,
                    combat: {
                        ...playerState.combat,
                        participants: response.data.participants
                    }
                }
            }
            return playerState
        })
    }

    async removeParticipant(participant_id: number) {
        let response = await client.DELETE('/participant/{participant_id}', {
            params: {
                path: { participant_id }
            }
        })
        if (!response) return;
        playerStateStore.update(playerState => {
            if (response.data && playerState.combat) {
                return {
                    ...playerState,
                    combat: {
                        ...playerState.combat,
                        participants: [
                            ...playerState.combat?.participants.filter(p => p.participant_id !== participant_id) || []
                        ]
                    }
                }
            }
            return playerState
        })
    }

    setName(participant_id: number, name: string) {
        return this.updateParticipant(participant_id, { name })
    }

    setIsVisible(participant_id: number, is_visible: boolean) {
        return this.updateParticipant(participant_id, { is_visible })
    }

    setIsPC(participant_id: number, is_PC: boolean) {
        return this.updateParticipant(participant_id, { is_PC })
    }

    setHasReaction(participant_id: number, has_reaction: boolean) {
        return this.updateParticipant(participant_id, { has_reaction })
    }

    setConditions(participant_id: number, conditions: string[]) {
        return this.updateParticipant(participant_id, { conditions: conditions.map(s => s.toLowerCase()).join(',') })
    }

    setAC(participant_id: number, ac: number) {
        return this.updateParticipant(participant_id, { ac })
    }

    setInitiative(participant_id: number, initiative: number) {
        return this.updateParticipant(participant_id, { initiative })
    }

    setColour(participant_id: number, colour: string) {
        return this.updateParticipant(participant_id, { colour })
    }

    setMaxHP(participant_id: number, max_hp: number) {
        return this.updateParticipant(participant_id, { max_hp })
    }

    setDamage(participant_id: number, damage: number) {
        return this.updateParticipant(participant_id, { damage })
    }

}

const PRESET_KEY = 'presets';
export type Preset = { key: string, state: playerState }
export const savePreset = (name: string) => {
    let currentState = get(playerStateStore);
    if (currentState.combat) console.warn("It isn't recommended to save combat. Weird stuff might happen.")
    let presets: Preset[] = JSON.parse(localStorage.getItem(PRESET_KEY) || '[]');
    presets = [
        ...presets.filter(p => p.key.toLocaleLowerCase() !== name.toLocaleLowerCase()),
        {
            key: name.toLocaleLowerCase(),
            state: currentState
        }
    ]
    localStorage.setItem('presets', JSON.stringify(presets))
}

export const loadPresetByKey = (name: string) => {
    let presets: Preset[] = JSON.parse(localStorage.getItem(PRESET_KEY) || '[]');
    let currentState: playerState | undefined = presets.find(p => p.key.toLocaleLowerCase() === name.toLocaleLowerCase())?.state
    if (currentState) playerStateStore.set(currentState)
}

export const loadPresetFromObject = (preset: Preset) => {
    playerStateStore.set(preset.state)
}


export const getPresets = () => {
    let presets: Preset[] = JSON.parse(localStorage.getItem(PRESET_KEY) || '[]');
    return presets
}