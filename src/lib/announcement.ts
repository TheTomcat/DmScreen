import { writable } from "svelte/store";

export let announcement = writable('')
export let isAnnouncing = writable(false)
export let awaitingCancel = writable(false)