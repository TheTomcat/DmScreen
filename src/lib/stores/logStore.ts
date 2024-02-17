import { writable } from "svelte/store";
import type { Participant } from "../../app";
import { date } from "zod";
import { cn } from "$lib/utils";
import type { ClassValue } from "clsx";

export type Log = {
    timestamp: number;
    message: string;
    metadata?: Metadata,
    styling?: ClassValue[]
};

export type Metadata = {
    participants?: Participant[]
}

export const logStore = writable<Log[]>([]);

export const push = (message: string, metadata?: Metadata, styling?: ClassValue[]) => {
    let log: Log = {
        timestamp: Date.now(),
        message,
        metadata,
        styling
    }
    logStore.update((logs) => [...logs, log])
}
