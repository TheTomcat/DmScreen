import { writable, derived } from "svelte/store";
import type { Combat, Participant, Entity, InitiativeRoll } from "../app";
import { apiAddParticipantToCombat, apiGetAllCombats, apiGetAllEntities, apiGetAllParticipants, apiGetCombat, apiModifyParticipant, apiRemoveParticipantFromCombat } from "$lib/api";


export type ParticipantID = Participant & { id: number }
type OrderedCombat = Combat & { order: number[] }

export const combat = writable<OrderedCombat>();
export const allEntities = writable<Entity[]>([]);
export let loading = writable(true);

export const sort_participants_naive = (a: Participant, b: Participant): number => {
    return b.initiative - a.initiative || b.initiative_modifier - a.initiative_modifier || a.participant_id - a.participant_id;
};

export const make_sort_participants_ordered = (order: number[]) => {
    return (a: Participant, b: Participant) => {
        if (!(order.includes(a.participant_id) || order.includes(b.participant_id))) return 0;
        return order.indexOf(a.participant_id) - order.indexOf(b.participant_id)
    }
}

const add_id = (p: Participant): ParticipantID => {
    return {
        ...p,
        id: p.participant_id
    }
}

const generate_ordering = (combat: Combat): number[] => {
    return combat.participants.sort(sort_participants_naive).map(p => p.participant_id)
}

export const getCombat = async (combat_id: number) => {
    apiGetCombat(fetch, combat_id)
        .then(result => {
            result.participants = result.participants.map(p => add_id(p))
            // result = 
            combat.set({ ...result, order: generate_ordering(result) });
            console.log(result);
            loading.set(false);
        })
}

export const getEntities = () => {
    apiGetAllEntities(fetch)
        .then(result => {
            allEntities.set(result)
        })
}

export const calculateOrdering = () => {
    combat.update(combat => {
        return { ...combat, order: generate_ordering(combat) }
    })
}

export const reorderParticipants = (newParticipants: Participant[]) => {
    // console.log(newParticipants)
    combat.update(combat => {
        return {
            ...combat,
            participants: newParticipants,
            order: newParticipants.map(p => p.participant_id)
        }
    })
}

export const addParticipant = (participant: Partial<Participant>) => {
    apiAddParticipantToCombat(fetch, participant).then((newParticipant) => {
        console.log(newParticipant);
        combat.update(combat => {
            console.log(combat.participants)
            return {
                ...combat,
                participants: [...combat.participants, add_id(newParticipant)],
                order: [...combat.order, newParticipant.participant_id]
            }
        })
    })
}
export const removeParticipant = (participant_id: number) => {
    apiRemoveParticipantFromCombat(fetch, { participant_id }).then(() => {
        combat.update(combat => {
            return {
                ...combat,
                participants: combat.participants.filter(participant => participant.participant_id != participant_id),
                order: combat.order.filter(id => id !== participant_id)
            }
        })
    })
}

export const updateParticipant = (updated_participant: Partial<Participant>): Promise<any> => {
    return apiModifyParticipant(fetch, updated_participant).then(() => {
        combat.update(combat => {
            let position = combat.participants.findIndex(participant => participant.participant_id == updated_participant.participant_id)

            // let [existing_participant] = combat.participants.filter(participant => participant.participant_id == updated_participant.participant_id);

            return {
                ...combat,
                participants: [
                    ...combat.participants.slice(0, position),
                    { ...combat.participants[position], ...updated_participant },
                    ...combat.participants.slice(position + 1)
                ]
                // combat.participants.map(p => (p.participant_id === updated_participant.participant_id) ? { ...p, updated_participant } : p)


                // ...combat.participants.filter(participant => participant.participant_id != updated_participant.participant_id),
                // { ...existing_participant, ...updated_participant }
                //].sort((a, b) => (a.initiative - b.initiative))
            }
        })
    })
}

export const setVisible = (participant_id: number, visibility: boolean) => {
    let partial_participant: Partial<Participant> = {
        participant_id, is_visible: visibility
    }
    return updateParticipant(partial_participant)
}

export const setName = (participant_id: number, name: string) => {
    let partial_participant: Partial<Participant> = {
        participant_id, name
    }
    return updateParticipant(partial_participant)
}

export const setReaction = (participant_id: number, reaction: boolean) => {
    let partial_participant: Partial<Participant> = {
        participant_id, has_reaction: reaction
    }
    return updateParticipant(partial_participant)
}

export const setCondition = (participant_id: number, conditions: string[]) => {
    let partial_participant: Partial<Participant> = {
        participant_id, conditions
    }
    return updateParticipant(partial_participant)
}

export const addCondition = (participant_id: number, conditions: string[], newCondition: string) => {
    let partial_participant: Partial<Participant> = {
        participant_id, conditions: [...conditions, newCondition]
    }
    return updateParticipant(partial_participant)
}

export const removeCondition = (participant_id: number, conditions: string[], removeCondition: string) => {
    let partial_participant: Partial<Participant> = {
        participant_id, conditions: conditions.filter(c => c !== removeCondition)
    }
    return updateParticipant(partial_participant)
}

export const setInitiative = (participant_id: number, initiative: number) => {
    let partial_participant: Partial<Participant> = {
        participant_id, initiative
    }
    return updateParticipant(partial_participant)
}

export const roll = (initiative: InitiativeRoll[]) => {
    combat.update(combat => {
        return {
            ...combat,
            participants: combat.participants.map((participant) => {
                let init = initiative.filter(initiative => {
                    initiative.participant_id == participant.participant_id
                })[0].initiative
                return { ...participant, initiative: init }
            })
        }
    })
}

