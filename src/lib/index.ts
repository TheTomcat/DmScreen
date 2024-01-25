// place files you want to import through the `$lib` alias in this folder.
import type { RollMode } from "../app";
import type { components } from "./api/v1";

type Participant = components['schemas']['Participant'];
type Combat = components['schemas']['Combat'];

export type status = { hp_max: number, hp_min: number, desc: string, style: string }

//https://rpg.stackexchange.com/questions/94726/how-to-improve-my-descriptions-of-the-health-status-of-monsters
export const statuses: status[] = [
    { hp_max: 100, hp_min: 100, desc: 'Untouched', style: 'color: green' },
    { hp_max: 100, hp_min: 75, desc: 'Barely a scratch', style: 'color: green' },
    { hp_max: 75, hp_min: 50, desc: 'Battered', style: 'color: yellow' },
    { hp_max: 50, hp_min: 25, desc: 'Bloodied', style: 'color: orange' },
    { hp_max: 25, hp_min: 10, desc: 'Badly injured', style: 'color: red' },
    { hp_max: 10, hp_min: 0, desc: 'Death\'s door', style: 'color: #a03' },
    { hp_max: 0, hp_min: 0, desc: 'Unconscious', style: 'color: grey; text-decoration-line: line-through' }
].toSorted((a, b) => b.hp_max - a.hp_max);
const statusDeathsdoor = statuses[5];
const statusUnconscious = statuses[6];

export const describeHealth = (participant: Participant): status => {

    if (!participant.max_hp) return statuses[0];
    if (participant.damage >= participant.max_hp) return statusUnconscious;
    if (participant.max_hp - participant.damage <= 10 && participant.max_hp >= 20) return statusDeathsdoor;
    let health = remainingHpPercent(participant);
    let result = statuses.find(e => e.hp_max >= health && e.hp_min <= health);
    //let result = Object.entries(statuses).find(([hp, desc]) => (parseInt(hp) <= health))
    return result || statuses[0]
}

export const roll = (dice: string | undefined | null, mode: RollMode = 'default'): number => {
    if (!dice) return 0;
    const re = /(\d+)\s*d\s*(\d+)(?:\s*\+\s*(\d+))*/;
    const components = dice.match(re);
    if (!components) return 0;
    let n = parseInt(components[1]);
    let d = parseInt(components[2]);
    let c = parseInt(components[3]) || 0;
    switch (mode) {
        case 'default':
            return Math.floor((n * (d + 1)) / 2 + c);
        case 'random':
            return Array(n)
                .fill(1)
                .map(() => roll_dice(d))
                .reduce((a, b) => a + b) + c;
        case 'min':
            return n + c;
        case 'max':
            return n * d + c;
        case 'one':
            return 1;
    }
};

export const ordinal = (n: number | string): string => {
    let lastDigit = `${n}`.at(-1) || 0;
    return `${n}` + (lastDigit == '1' ? 'st' : lastDigit == '2' ? 'nd' : lastDigit == '3' ? 'rd' : 'th')
}

export const roll_dice = (d: number): number => {
    return Math.floor(Math.random() * d) + 1;
};

export const renderModifier = (modifier: number): string => {
    if (modifier >= 0) return `+${modifier}`;
    return `${modifier}`;
};
export const renderModifierFromAbilityScore = (abilityScore: number): string => {
    return renderModifier(Math.floor((abilityScore - 10) / 2))
}

export const rollDice = (d: number, modifier: number): number => {
    return Math.floor(Math.random() * d) + 1 + modifier;
}

export const debounce = (mainFunction: Function, delay: number) => {
    let timer: number;

    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            mainFunction.apply(this, args);
        }, delay);
    };
};

export const capitalise = (text: string): string => {
    return text.slice(0, 1).toUpperCase().concat(text.slice(1))
}

export const sort_participants_naive = (a: Participant, b: Participant): number => {
    let s1 = (a.initiative && b.initiative) ? b.initiative - a.initiative : 0
    let s2 = (a.initiative_modifier && b.initiative_modifier) ? b.initiative_modifier - a.initiative_modifier : 0
    let s3 = a.participant_id - b.participant_id;
    return s1 || s2 || s3;
};

export const sort_participants_by_id = (a: Participant, b: Participant): number => {
    return a.participant_id - b.participant_id;
}

export const make_sort_participants_ordered = (order: number[]) => {
    console.error("make_sort_participants_ordered is depreciated")
    return (a: Participant, b: Participant) => {
        if (!(order.includes(a.participant_id) || order.includes(b.participant_id))) return 0;
        return order.indexOf(a.participant_id) - order.indexOf(b.participant_id)
    }
}

export const get_next_participant_id = (current_participant_id: number, participants: Participant[]): { next_participant_id: number, have_looped: boolean } => {
    let p = participants.filter(p => p.is_visible || p.participant_id === current_participant_id).toSorted(sort_participants_naive);
    let i = p.findIndex(p => p.participant_id == current_participant_id);
    if (i == -1) {
        console.log("Invalid next participant?")
        return { next_participant_id: current_participant_id, have_looped: false };
    }
    let next = (i + 1) % p.length
    //console.log({ next_participant_id: p[next].participant_id, have_looped: next == 0 })
    return { next_participant_id: p[next].participant_id, have_looped: next == 0 }
}

export const get_top_initiative_id = (participants: Participant[]): number => {
    let p = participants.filter(p => !is_dead(p) && p.is_visible).toSorted(sort_participants_naive);
    return p[0].participant_id;
}

export const is_dead = (p: Participant): boolean => {
    if (p.damage && p.max_hp) {
        return p.damage >= p.max_hp;
    }
    return false;
};
export const is_active = (ps: Participant[]): boolean => {
    return ps.every((p) => p.initiative && p.initiative > 0);
};

export const get_next_alive_participant_id = (current_participant_id: number, participants: Participant[]): { next_participant_id: number, have_looped: boolean } => {
    let aliveOrPC = participants.filter(p => (!is_dead(p)) || p.is_PC || p.participant_id == current_participant_id)
    return get_next_participant_id(current_participant_id, aliveOrPC);
}

export const get_next_PC = (current_participant_id: number, participants: Participant[]): { next_participant_id: number, have_looped: boolean } => {
    let PCs = participants.filter(p => p.is_PC || p.participant_id == current_participant_id)
    return get_next_participant_id(current_participant_id, PCs)
}

export const remainingHpPercent = (participant: Participant): number => {
    if (participant.max_hp == undefined) return 100;
    if (participant.damage == undefined) return 100;
    return Math.round((100 * (participant.max_hp - participant.damage)) / participant.max_hp);
};
export const remainingHp = (participant: Participant): number => {
    if (participant.max_hp == undefined) return 100;
    if (participant.damage == undefined) return 100;
    return participant.max_hp - participant.damage;
};



export function makeCancelable<T>(promise: Promise<T>) {
    let hasCanceled_ = false;

    const wrappedPromise: Promise<T> = new Promise((resolve, reject) => {
        promise.then((val) =>
            hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)
        );
        promise.catch((error) =>
            hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
};


export const smartName = (current_participant_id: number, participants: Participant[]): string => {
    let name = participants.find(p => p.participant_id == current_participant_id)?.name;
    if (!name) return "";
    // If this isn't a smart name, just return it
    if (!name.includes('@')) return name;
    // We're using smart naming, boys! Saddle up!
    // First, determine if combat has started. if not, just return the name (minus @)
    // Combat has started <==> all participants have an initiative roll
    if (!participants.every(p => p.initiative && p.initiative)) return `${name.substring(1)}`
    // Get every participant with the same name in the current participant list, sorted by initiative order 
    let sameNames = participants.filter(p => p.name && p.name == name).toSorted(sort_participants_naive);
    // Find us in this list
    let myPosition = sameNames.findIndex(p => p.participant_id == current_participant_id);
    return `${name.substring(1)} ${myPosition + 1}`
}

// export const updateSelected = (originalData: T[], newData: T[], getID: ((p: T)=>number)) => {
//     return [
//         ...originalData.filter(p => newData.)
//     ]
// }


// const testSmartName = () => {
//     let participants: Participant[] = [{
//         name: '@Goblin',
//         participant_id: 1,
//     }, {
//         name: '@Goblin',
//         participant_id: 2,
//     }, {
//         name: '@Goblin',
//         participant_id: 3,
//     }]
//     smartName(1, participants) == 'Goblin' //Combat has not started, name should just be name
//     participants = [{
//         name: '@Goblin',
//         participant_id: 1,
//         initiative: 20
//     }, {
//         name: '@Goblin',
//         participant_id: 2,
//         initiative: 12
//     }, {
//         name: '@Goblin',
//         participant_id: 3,
//         initiative: 21
//     }]
//     smartName(3, participants) == 'Goblin 1' //Combat has started, id=3 is the first gobby boy
// }