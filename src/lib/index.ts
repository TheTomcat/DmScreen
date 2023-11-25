// place files you want to import through the `$lib` alias in this folder.
import type { RollMode } from "../app";
import type { components } from "./api/v1";

type Participant = components['schemas']['Participant'];
type Combat = components['schemas']['Combat'];

export const roll = (dice: string | undefined, mode: RollMode = 'default'): number => {
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

export const roll_dice = (d: number): number => {
    return Math.floor(Math.random() * d) + 1;
};

export const renderModifier = (modifier: number): string => {
    if (modifier >= 0) return `+${modifier}`;
    return `${modifier}`;
};

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

export const make_sort_participants_ordered = (order: number[]) => {
    return (a: Participant, b: Participant) => {
        if (!(order.includes(a.participant_id) || order.includes(b.participant_id))) return 0;
        return order.indexOf(a.participant_id) - order.indexOf(b.participant_id)
    }
}

export const get_next_participant_id = (current_participant_id: number, participants: Participant[]): { next_participant: number, have_looped: boolean } => {
    let p = participants.toSorted(sort_participants_naive);
    let i = p.findIndex(p => p.participant_id == current_participant_id);
    if (i == -1) return { next_participant: current_participant_id, have_looped: false };
    let next = (i + 1) % p.length

    return { next_participant: p[next].participant_id, have_looped: i <= next }
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

export const get_next_alive_participant_id = (current_participant_id: number, participants: Participant[]): { next_participant: number, have_looped: boolean } => {
    let aliveOrPC = participants.filter(p => (!is_dead(p)) || p.is_PC || p.participant_id == current_participant_id)
    return get_next_participant_id(current_participant_id, aliveOrPC);
}

export const get_next_PC = (current_participant_id: number, participants: Participant[]): { next_participant: number, have_looped: boolean } => {
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

export const describeHealth = (participant: Participant): string => {
    let health = remainingHpPercent(participant);
    const statuses: { [hp: number]: string } = {
        100: 'Untouched',
        75: 'Battered',
        50: 'Bloodied',
        25: 'Critically injured',
        5: 'Death\'s door'
    }
    let result = Object.entries(statuses).find(([hp, desc]) => (parseInt(hp) <= health))
    return result ? result[1] : statuses[100];
}

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