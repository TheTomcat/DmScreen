import { writable, derived, type Readable } from "svelte/store";
import type { Tag, _ImageMatch } from "../app";
import { apiGetImageTagMatch } from "$lib/api";

export const selectedTags = writable<Tag[]>([]);

export const addTagToSearchTags = (tagName: Tag) => {
    selectedTags.update((currentTags: Tag[]) => {
        if (!currentTags.includes(tagName)) {
            const newTags = [...currentTags, tagName];
            return newTags;
        } else {
            return currentTags;
        }
    });
}
export const removeTagFromSearchTags = (tagId: number) => {
    selectedTags.update(selectedTags => selectedTags.filter(tag => tag.tag_id != tagId))
}
export const setTags = selectedTags.set

export const galleryItems: Readable<_ImageMatch[]> = derived(selectedTags, ($selectedTags, set) => {
    if ($selectedTags.length == 0) {
        set([]);
    } else {
        const promise = apiGetImageTagMatch($selectedTags.map(tag => tag.tag_id))
            .then(({ images }) => {
                set(images)
            }).catch((error) => {
                set([])
                throw new Error("Api error");
            })
    }
})

function debounce(func: Function, timeoout = 1000) {
    let timer: number;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(func, args); }, timeoout)
    }
}