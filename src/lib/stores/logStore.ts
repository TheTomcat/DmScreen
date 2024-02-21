import { writable } from "svelte/store";
import type { Participant } from "../../app";
import { cn } from "$lib/utils";
import type { ClassValue } from "clsx";
import { toast } from "svelte-sonner";
import type { PlusCircle } from "lucide-svelte";

export type Log = {
    timestamp: number;
    message: string;
    metadata?: Metadata,
    styling?: ClassValue[],
    action?: Action
};

export type Action = {
    icon?: typeof PlusCircle,
    label: string,
    onClick: () => void
}
export type Metadata = {
    participants?: Participant[]
}

export const logStore = writable<Log[]>([]);

export const push = (message: string, props?: { metadata?: Metadata, styling?: ClassValue[], action?: Action }, showToast = false) => {
    let log: Log = {
        timestamp: Date.now(),
        message,
        metadata: props?.metadata,
        styling: props?.styling,
        action: props?.action
    }
    logStore.update((logs) => [...logs, log])
    if (showToast) toast(message, props)
}

export const clear = () => {
    logStore.set([]);
}