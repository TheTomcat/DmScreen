import type { Combat, Participant, ParticipantUpdate } from "../app";
import { writable, type Writable, derived } from "svelte/store";
import client from "$lib/api/index";

let annoucementTimerId: number;

type wsEventHandler = (e: MessageEvent<string>) => void

type wsEventType = "changeMode"
    | "beginCombat"
    | "updateCombat"
    | "advanceCombat"
    | "suspendCombat"
    | "setBackgroundImage"
    | "setLoadingMessage"
    | "announce"
    | "clearAnnouncement"
    | "showSpinner"
    | "provideStatus"
    | "requestStatus"
    | "notifyBackgroundImage"
    | "notifyMessage"

export type wsPlayerMode = "loading" | "backdrop" | "combat" | "handout" | "map" | "idle";
type wsEventChangeMode = {
    event: 'changeMode'
    mode: wsPlayerMode
}
type wsEventBeginCombat = {
    event: 'beginCombat'
    combat: Combat
}
type wsEventUpdateCombat = {
    event: 'updateCombat'
    combat: Combat
}
type wsEventAdvanceCombat = {
    event: 'advanceCombat'
    next_participant_id: number
}
type wsEventSuspendCombat = {
    event: 'suspendCombat'
}
type wsEventSetBackgroundImage = {
    event: 'setBackgroundImage'
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
    handout_id: number | undefined
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

type event = {
    event: wsEventType
}

// type Omit<T, event extends keyof T> = Pick<T, Exclude<keyof T, event>>

export type playerState = {
    mode: wsPlayerMode
    combat: Combat | undefined
    combat_display: boolean
    background_image_id: number | undefined
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
}

export type wsEvent = wsEventChangeMode
    | wsEventBeginCombat
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
    | wsEventNotifyMessage;

export const playerStateStore = writable<playerState>();
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
    playerStateStore.set({
        mode: 'backdrop',
        combat: undefined,
        combat_display: false,
        background_image_id: undefined,
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
    })
}

export const handleMessageEvent = (e: MessageEvent<string>) => { //, isClient: boolean) => {
    handleWSEvent(JSON.parse(e.data) as wsEvent) //, isClient)
}
/**
 * This is the handler function for both the client and the controller,
 * which takes a wsEvent as the parameter then updates the store. This happens
 * on both the client (upon recieving the message) and the controller (after sending)
 * @param e wsEvent
 */
const handleWSEvent = (e: wsEvent) => { //, isClient: boolean = false) => {
    switch (e.event) {
        case 'changeMode':
            playerStateStore.update(makeChangeMode(e))
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
            // if (isClient) return
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
        case "requestStatus":
            // playerStateStore.update(makeSetLoadingMessage(e))
            break;
        case "provideStatus":
            playerStateStore.set(e.state);
            break;
        case "announce":
            playerStateStore.update(makeAnnounce(e))
            clearInterval(annoucementTimerId);
            if (e.timeout > 0) {
                console.log(`scheduling update for ${e.timeout}`)
                annoucementTimerId = setInterval(() => playerStateStore.update(clearAnnounce), e.timeout)
            }
            break;
        case "clearAnnouncement":
            playerStateStore.update(clearAnnounce);
            break;
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
            background_image_display: data.display,
            background_image_timeout: data.timeout || 30000,
            background_image_cycle: data.cycle,
        }
    }
    return setBackgroundImage
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
            ...playerState, combat: data.combat, combat_display: true
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
        return playerState;
    }
    return suspendCombat
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
        this.ws = connect(endpoint, (e) => { console.log(e); handleMessageEvent(e) }); //*/ handleEvent);
        this.ws.onclose = this.handleDisconnect;
    }
    handleDisconnect() {
        console.log("Disconnected")
    }
    close() {
        this.ws.close();
    }
    // This is not fully implemented yet.
    provideStatus(playerState: playerState) {
        let event: wsEventProvideStatus = {
            event: 'provideStatus',
            state: playerState
        }
        this.ws.send(JSON.stringify(event))
    }
}


export class wsController {
    ws: WebSocket;
    constructor(endpoint: string) {
        this.ws = connect(endpoint);
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
    requestStatus() {
        let event: wsEventRequestStatus = { event: 'requestStatus' }
        this.ws.send(JSON.stringify(event))
    }
    //////////COMBAT METHODS
    //////////These differ from the above messages, as the store manipulation is done
    ////////// on the "controller" side, and the completed combat object is sent en bloc
    ////////// to the client. Be sure to call updateCombat afterwards, as this is not automatic. 

    async updateParticipant(participant_id: number, updated_participant: ParticipantUpdate) {
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
        return this.updateParticipant(participant_id, { conditions: conditions.map(String.prototype.toLowerCase).join(',') })
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

    setDamage(participant_id: number | undefined, damage: number) {
        if (!participant_id) return;
        return this.updateParticipant(participant_id, { damage })
    }
}

