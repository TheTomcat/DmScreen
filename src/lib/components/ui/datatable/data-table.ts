import type { Check } from 'lucide-svelte';
import { writable } from 'svelte/store';

export type selectType = {
    value: string;
    label: string;
    icon: typeof Check | undefined;
};

export const createSelection = () => {
    const selectedDataIDs = writable<number[]>([]);
    const addID = (id: number) => {
        selectedDataIDs.update((selectedDataIDs) => {
            if (selectedDataIDs.includes(id)) return selectedDataIDs
            return [...selectedDataIDs, id].toSorted()
        })
    }
    const removeID = (id: number) => {
        selectedDataIDs.update((selectedDataIDs) => {
            if (!selectedDataIDs.includes(id)) return selectedDataIDs
            return selectedDataIDs.filter(i => i !== id)
        })
    }
    const clear = () => {
        selectedDataIDs.set([])
    }

    return { selectedDataIDs, addID, removeID, clear }
}