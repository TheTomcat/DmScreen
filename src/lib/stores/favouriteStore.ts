import { persisted } from "svelte-persisted-store";
import type { Collection, ImageURL } from "../../app";
import { get, writable } from "svelte/store";
import client from "$lib/api/index";

export type Favourite = Collection | ImageURL;
export type Identifier = ({ collection_id: number, [key: string]: any } | { image_id: number, [key: string]: any })

export const favouriteStore = persisted<Favourite[]>('favourites', []);
export const age = writable<number>(0)

const refreshAge = () => {
    age.set(Date.now())
}

export const addFavourite = (element: Favourite) => {
    favouriteStore.update((favouriteStore) => {
        return [...favouriteStore, element]
    })
}

export const removeFavourite = (identifier: Identifier) => {
    favouriteStore.update((favouriteStore) => {
        return favouriteStore.filter(f => !compare(f, identifier))
    })
    // if ('collection_id' in identifier) {
    //     favouriteStore.update((favouriteStore) => {
    //         return favouriteStore.filter(f => {
    //             'collection_id' in f && f.collection_id == identifier.collection_id
    //         })
    //     })
    // } else {
    //     favouriteStore.update((favouriteStore) => {
    //         return favouriteStore.filter(f => {
    //             'image_id' in f && f.image_id == identifier.image_id
    //         })
    //     })
    // }
}

const compare = (item1: Identifier, item2: Identifier): boolean => {
    return ('image_id' in item1 && 'image_id' in item2 && item1.image_id == item2.image_id) ||
        ('collection_id' in item1 && 'collection_id' in item2 && item1.collection_id == item2.collection_id)
}

const isFavourite = (f: Favourite | undefined): f is Favourite => {
    return !!f
}

export const contains = (item: Identifier) => {
    return !!get(favouriteStore).find(f => compare(f, item))
}

// export const refresh = async () => {
//     freshness.set('updating')
//     favouriteStore.update((favouriteStore) => {
//         return await Promise.all()
//         favouriteStore.map(f => {
//             if ('image_id' in f) return f
//             return client.GET('/collection/{collection_id}',
//                 { params: { path: { collection_id: f.collection_id } } })
//                 .then(response => {
//                     if (!response || !response.data) return undefined
//                     return response.data
//                 })
//         }).filter(isFavourite) as Favourite[]
//     })
//     freshness.set('fresh')
// }

