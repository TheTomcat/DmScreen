import type { Combat } from "../app";
import { writable, derived, type Readable } from "svelte/store";

type wsEventHandler = (e: MessageEvent<wsEvent>) => {}

type wsEventType = "changeMode" | "beginCombat" | "updateCombat" | "advanceCombat" | "setBackgroundImage" | "setLoadingMessage" | "announce"
type wsPlayerMode = "loading" | "backdrop" | "combat" | "handout" | "map" | "idle";
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
type wsEventSetBackgroundImage = {
    event: 'setBackgroundImage'
    display: boolean
    image_id: number | undefined
    background_image_timeout: number | undefined
}
type wsEventSetLoadingMessage = {
    event: 'setLoadingMessage'
    display: boolean
    message_id: number | undefined
}
type wsEventAnnounce = {
    event: 'announce'
    message: string
    timeout: number
}

type playerState = {
    mode: wsPlayerMode
    combat: Combat | undefined
    background_image_id: number | undefined
    background_image_timeout: number
    background_image_display: boolean
    message_id: number | undefined
    message_display: boolean
    announce_text: string | undefined
    announce_timeout: number
}

export type wsEvent = wsEventChangeMode | wsEventBeginCombat | wsEventUpdateCombat | wsEventAdvanceCombat | wsEventSetBackgroundImage | wsEventSetLoadingMessage | wsEventAnnounce;

export const connect = (endpoint: string, wsEventHandler: wsEventHandler | undefined) => {
    let ws: WebSocket;
    let path = new URL(`${endpoint}`, window.location.toString());
    path.protocol = 'ws:';
    ws = new WebSocket(path);
    if (wsEventHandler) {
        ws.addEventListener('message', wsEventHandler);
    }
    return ws;
};

export const playerStateStore = writable<playerState>();

export const initialise = () => {
    playerStateStore.set({
        mode: 'idle',
        combat: undefined,
        background_image_id: undefined,
        background_image_timeout: 30000,
        background_image_display: false,
        message_id: undefined,
        message_display: false,
        announce_text: undefined,
        announce_timeout: 10000
    })
}

export const handleEvent = (e: MessageEvent<wsEvent>) => {
    switch (e.data.event) {
        case 'changeMode':
            e.data.mode
            break;
        case "beginCombat":
            e.data.combat
            break;
        case "updateCombat":
            break;
        case "advanceCombat":
            break;
        case "setBackgroundImage":
            break;
        case "setLoadingMessage":
            playerStateStore.update()
            break;
        case "announce":
            break;
    }
}

const setLoadingMessage = (playerState: playerState, e: wsEventSetLoadingMessage): playerState => {
    return {
        ...playerState, message_id: e.message_id, message_display: e.display
    }
}