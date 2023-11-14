import { readonly, writable, derived } from "svelte/store";
import type { Tag } from "../../app";


export const allTags = writable<Tag[]>([]);

export const getTags = async () => {
    const tags = await apiGetAllTags(fetch);
    allTags.set(tags);
}

