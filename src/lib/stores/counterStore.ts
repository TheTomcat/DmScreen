import { writable } from "svelte/store";
import type { Participant } from "../../app";

export type CounterType = {
    title: string;
    id: string;
    total: number;
    numConsumed: number;
    resetOn: string;
};

export const counters = writable<CounterType[]>([]);

const sep = ":";

export const makeCounterID = (p: Participant, isFor: string): string => {
    return `${p.combat_id}${sep}${p.participant_id}${sep}${isFor}`;
};
export const splitCounterID = (id: string): [string, string, string] => {
    return id.split(sep) as [string, string, string]
}

export const findCounter = (p: Participant, isFor: string) => {
    return (c: CounterType) => (c.id == makeCounterID(p, isFor))
}
export const findCounterById = (id: string) => {
    return (c: CounterType) => (c.id == id)
}
export const findCountersByParticipant = (p: Participant) => {
    return (c: CounterType) => (splitCounterID(c.id)[1] == `${p.participant_id}`)
}
const remaining = (c: CounterType): number => {
    return c.total - c.numConsumed
}
export const isEmpty = (c: CounterType | undefined): boolean => {
    if (!c) return true
    return c.numConsumed >= c.total
}

/**
 * Create a new counter (unless it already has been created!)
 * @param p Participant
 * @param isFor the key for the particular counter
 * @param title The human-readable title
 * @param total Total amount to be counted
 * @param numConsumed Amount already consumed
 * @param resetOn Event on which to reset the counter
 */
export const createCounter = (
    p: Participant,
    isFor: string,
    title: string,
    total: number,
    numConsumed: number,
    resetOn: string
) => {
    counters.update((counters: CounterType[]) => {
        let id: string = makeCounterID(p, isFor);
        let counter = counters.find((c) => c.id == id);
        if (counter) {
            return counters
        }
        counter = { id, title, total, numConsumed, resetOn }

        counters = [...counters, counter];
        return counters;
    })
    return makeCounterID(p, isFor);
};

/**
 * Set a counter (by ID) to a value remaining
 * @param id The ID of the counter to set
 * @param qty The quantity to set it to. If this is more than the total, it will silently do nothing
 */
export const setCounter = (id: string, qty: number) => {
    counters.update(counters => {
        return counters.map((counter: CounterType) => {
            return {
                ...counter,
                numConsumed: counter.id == id && counter.total >= qty ? counter.total - qty : counter.numConsumed
            }
        })
    })
}

/**
 * Reset counters based on an event. 
 * @param isFor The event to send to the counters
 */
export const dispatchGeneralCounterEvent = (isFor: string) => {
    counters.update(counters => {
        return counters.map((counter: CounterType) => {
            return { ...counter, numConsumed: counter.resetOn == isFor ? 0 : counter.numConsumed }
        })
    })
}
export const dispatchParticipantCounterEvent = (participant_id: number, event: string) => {
    counters.update(counters => {
        return counters.map((counter: CounterType) => {
            return { ...counter, numConsumed: counter.resetOn == event && splitCounterID(counter.id)[1] == `${participant_id}` ? 0 : counter.numConsumed }
        })
    })
}
/**
 * Reduce a counter (by ID) by a specific quantity. Will silently exit if not enough quantity remains. 
 * @param id The ID of the counter from which to consume
 * @param qty The amount to consume
 */
export const consume = (id: string, qty: number = 1) => {
    counters.update(counters => {
        return counters.map((counter: CounterType) => {
            return {
                ...counter,
                numConsumed: counter.id == id && remaining(counter) >= qty ? counter.numConsumed + qty : counter.numConsumed
            }
        })
    })
}

/**
 * Reduce a counter (by ID) by a specific quantity. Will silently exit if not enough quantity remains. 
 * @param id The ID of the counter from which to consume
 * @param qty The amount to consume
 */
export const consumeByParticipant = (p: Participant, isFor: string, qty: number = 1) => {
    console.log(p, isFor, qty)
    let id = makeCounterID(p, isFor);
    counters.update(counters => {
        return counters.map((counter: CounterType) => {
            return {
                ...counter,
                numConsumed: counter.id == id && remaining(counter) >= qty ? counter.numConsumed + qty : counter.numConsumed
            }
        })
    })
}

/**
 * Delete a counter
 * @param id The id of the counter to delete
 */
export const deleteCounter = (id: string) => {
    counters.update(counters => counters.filter(counter => counter.id !== id))
}

/**
 * Reset all counters to full
 */
export const resetAllCounters = () => {
    counters.update(counters => {
        return counters.map(counter => {
            return { ...counter, numConsumed: 0 }
        })
    })
}

/**
 * Scrub all counters and remove them from the store
 */
export const deleteAllCounters = () => {
    counters.update(counters => [])
}