import { writable, derived } from "svelte/store";
import type { Combat, Participant, Entity, InitiativeRoll } from "../../app";
import client from "$lib/api/index";
import type { components, paths } from "$lib/api/v1";
import { get_next_participant_id } from "$lib";
// import { apiAddParticipantToCombat, apiGetAllCombats, apiGetAllEntities, apiGetAllParticipants, apiGetCombat, apiModifyParticipant, apiRemoveParticipantFromCombat } from "$lib/api";
// import { is_active } from "$lib";
type ParticipantUpdate = components['schemas']['ParticipantUpdate'];

export type ParticipantID = Partial<Participant> & { participant_id: number }
// type OrderedCombat = Combat & { order: number[] }
export type State = "loading" | "ok" | "error"
export const combat = writable<Combat>();
export const state = writable<State>("loading");
//export const isActive = derived(combat, ($combat) => is_active($combat.participants));

type Initiative = { participant_id: number; initiative: number };

type A = paths["/participant/{participant_id}"]['patch'];

const ok = () => {
    state.set("ok")
}
const loading = () => {
    state.set("loading")
}
const error = () => {
    state.set("error")
}


export const loadCombat = async (combat_id: number) => {
    loading();
    let response = await client.GET('/combat/{combat_id}', { params: { path: { combat_id } } });
    if (response.error) {
        error();
        return;
    }
    combat.set(response.data);
    ok();
}

export const set_is_active = async (combat_id: number, is_active: boolean) => {
    loading();
    let response = await client.PATCH('/combat/{combat_id}', {
        params: { path: { combat_id } },
        body: { is_active }
    });
    if (response.error) {
        error();
        return
    }
    combat.update(combat => {
        return { ...combat, ...response.data }
    })
}

export const set_active_participant = async (combat_id: number, active_participant_id: number, increment_round: boolean = false) => {
    // loading();
    let response = await client.PATCH('/combat/{combat_id}', {
        params: { path: { combat_id } },
        body: { active_participant_id }
    });
    if (response.error) {
        error();
        return
    }
    ok();
    combat.update(combat => {
        // console.log(response.data)
        return { ...combat, ...response.data, round: combat.round + (increment_round ? 1 : 0) }
    })
}

export const set_title = async (combat_id: number, title: string) => {
    // loading();
    let response = await client.PATCH('/combat/{combat_id}', {
        params: { path: { combat_id } },
        body: { title }
    });
    if (response.error) {
        error();
        return
    }
    combat.update(combat => {
        return { ...combat, ...response.data }
    })
    ok();
}

export const setInitiatives = async (combat_id: number, initiatives: Initiative[], start_combat: boolean = true) => {
    // loading();
    let max_init_id = initiatives.toSorted((a, b) => b.initiative - a.initiative)[0].participant_id
    let response = await client.PATCH('/combat/{combat_id}', {
        params: { path: { combat_id } },
        body: { participants: initiatives, is_active: start_combat, active_participant_id: max_init_id, round: 0 }
    });
    if (response.error) {
        error();
        return
    }
    combat.update(combat => {
        console.log(response.data)
        if (response.data) return response.data
        return combat;
    })
}

export const suspendCombat = async (combat_id: number) => {
    // loading();
    let response = await client.PATCH('/combat/{combat_id}', {
        params: { path: { combat_id } },
        body: { is_active: false, active_participant_id: null }
    });
    if (response.error) {
        error();
        return
    }
    combat.update(combat => {
        return { ...combat, ...response.data }
    })
}



const updateParticipant = async (participant_id: number, updated_participant: ParticipantUpdate) => {
    let response = await client.PATCH('/participant/{participant_id}', {
        params: { path: { participant_id } },
        body: { ...updated_participant }
    })
    if (response.error) {
        error()
        return;
    }
    combat.update((combat) => {
        // let index = newCombat.participants.findIndex(p => p.participant_id == updated_participant.participant_id);
        if (response.data)
            return {
                ...combat,
                participants: [
                    ...combat.participants.filter(p => p.participant_id != participant_id),
                    response.data
                ]
                // ...newCombat,
                // participants: [
                //     ...newCombat.participants.slice(0, index),
                //     response.data,
                //     ...newCombat.participants.slice(index + 1)
                // ]
            }
        return combat
    })
}

export const setName = (participant_id: number, name: string) => {
    return updateParticipant(participant_id, { name })
}

export const setIsVisible = (participant_id: number, is_visible: boolean) => {
    return updateParticipant(participant_id, { is_visible })
}

export const setIsPC = (participant_id: number, is_PC: boolean) => {
    return updateParticipant(participant_id, { is_PC })
}

export const setHasReaction = (participant_id: number, has_reaction: boolean) => {
    return updateParticipant(participant_id, { has_reaction })
}

export const setConditions = (participant_id: number, conditions: string[]) => {
    return updateParticipant(participant_id, { conditions: conditions.map(String.prototype.toLowerCase).join(',') })
}

export const setAC = (participant_id: number, ac: number) => {
    return updateParticipant(participant_id, { ac })
}

export const setInitiative = (participant_id: number, initiative: number) => {
    return updateParticipant(participant_id, { initiative })
}

export const setColour = (participant_id: number, colour: string) => {
    return updateParticipant(participant_id, { colour })
}

export const setMaxHP = (participant_id: number, max_hp: number) => {
    return updateParticipant(participant_id, { max_hp })
}

export const setDamage = (participant_id: number | undefined, damage: number) => {
    if (!participant_id) return;
    return updateParticipant(participant_id, { damage })
}

// export const changeHp = (participant_id: number, damage: number) => {
//     combat.update((combat) => {

//     })
//     return updateParticipant({ participant_id, has_reaction })
// }

// export const allEntities = writable<Entity[]>([]);
// export let loading = writable(true);

// export const make_sort_participants_ordered = (order: number[]) => {
//     return (a: Participant, b: Participant) => {
//         if (!(order.includes(a.participant_id) || order.includes(b.participant_id))) return 0;
//         return order.indexOf(a.participant_id) - order.indexOf(b.participant_id)
//     }
// }

// const add_id = (p: Participant): ParticipantID => {
//     return {
//         ...p,
//         id: p.participant_id
//     }
// }

// const generate_ordering = (combat: Combat): number[] => {
//     return combat.participants.sort(sort_participants_naive).map(p => p.participant_id)
// }



// export const getEntities = () => {
//     apiGetAllEntities(fetch)
//         .then(result => {
//             allEntities.set(result)
//         })
// }

// export const calculateOrdering = () => {
//     combat.update(combat => {
//         return { ...combat, order: generate_ordering(combat) }
//     })
// }

// export const reorderParticipants = (newParticipants: Participant[]) => {
//     // console.log(newParticipants)
//     combat.update(combat => {
//         return {
//             ...combat,
//             participants: newParticipants,
//             order: newParticipants.map(p => p.participant_id)
//         }
//     })
// }

// export const addParticipant = (participant: Partial<Participant>) => {
//     apiAddParticipantToCombat(fetch, participant).then((newParticipant) => {
//         console.log(newParticipant);
//         combat.update(combat => {
//             console.log(combat.participants)
//             return {
//                 ...combat,
//                 participants: [...combat.participants],//, add_id(newParticipant)],
//                 //order: [...combat.order, newParticipant.participant_id]
//             }
//         })
//     })
// }
// export const removeParticipant = (participant_id: number) => {
//     apiRemoveParticipantFromCombat(fetch, { participant_id }).then(() => {
//         combat.update(combat => {
//             return {
//                 ...combat,
//                 participants: combat.participants.filter(participant => participant.participant_id != participant_id),
//                 //order: combat.order.filter(id => id !== participant_id)
//             }
//         })
//     })
// }



// export const setVisible = (participant_id: number, visibility: boolean) => {
//     let partial_participant: Partial<Participant> = {
//         participant_id, is_visible: visibility
//     }
//     return updateParticipant(partial_participant)
// }

// export const setName = (participant_id: number, name: string) => {
//     let partial_participant: Partial<Participant> = {
//         participant_id, name
//     }
//     return updateParticipant(partial_participant)
// }

// export const setReaction = (participant_id: number, reaction: boolean) => {
//     let partial_participant: Partial<Participant> = {
//         participant_id, has_reaction: reaction
//     }
//     return updateParticipant(partial_participant)
// }

// export const setCondition = (participant_id: number, conditions: string[]) => {
//     let partial_participant: Partial<Participant> = {
//         participant_id, conditions
//     }
//     return updateParticipant(partial_participant)
// }

// export const addCondition = (participant_id: number, conditions: string[], newCondition: string) => {
//     let partial_participant: Partial<Participant> = {
//         participant_id, conditions: [...conditions, newCondition]
//     }
//     return updateParticipant(partial_participant)
// }

// export const removeCondition = (participant_id: number, conditions: string[], removeCondition: string) => {
//     let partial_participant: Partial<Participant> = {
//         participant_id, conditions: conditions.filter(c => c !== removeCondition)
//     }
//     return updateParticipant(partial_participant)
// }

// export const setInitiative = (participant_id: number, initiative: number) => {
//     let partial_participant: Partial<Participant> = {
//         participant_id, initiative
//     }
//     return updateParticipant(partial_participant)
// }

// // export const roll = (initiative: InitiativeRoll[]) => {
// //     combat.update(combat => {
// //         return {
// //             ...combat,
// //             participants: combat.participants.map((participant) => {
// //                 let init = initiative.filter(initiative => {
// //                     initiative.participant_id == participant.participant_id
// //                 })[0].initiative
// //                 return { ...participant, initiative: init }
// //             })
// //         }
// //     })
// // }

