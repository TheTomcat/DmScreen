type Stat = "str" | "dex" | "con" | "int" | "wis" | "cha"
type Speed = "walk" | "fly" | "burrow" | "swim" | "climb"
type Skill = "athletics" | "acrobatics" | "sleight of hand" | "stealth" | "arcana" | "history" | "investigation" | "nature" | "religion" | "animal handling" | "insight" | "medicine" | "perception" | "survival" | "deception" | "intimidation" | "performance" | "persuasion"

type SpellLevel = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
type Cantrip = "0"

type ItemEntry = {
    type?: "item"
    style?: string
    name: string,
    entries?: string[]
    entry?: string
}

type ListEntry = {
    type: "list"
    style: string
    items: ItemEntry[] | string[] // (ItemEntry | string)[]
}

type ExtText = {
    // type?: string
    // style?: string
    name: string,
    entries: (string | ListEntry)[]
}

type SpellcastingSlots = {
    name: string
    headerEntries?: string[]
    footerEntries?: string[]
    hidden?: string[]
    ability: Stat
    spells?: Spells //{ [level in SpellLevel]?: { slots?: number, spells: string[] } }
}

type Spells = {
    [level in SpellLevel]?: { slots: number, spells: string[] }
} & { "0"?: { spells: string[] } }

type SpellcastingDaily = {
    name: string
    headerEntries: string[]
    will: string[]
    daily?: { [perDay: string]: string[] }
    ability: Stat
}

type Spellcasting = SpellcastingDaily | SpellcastingSlots

type Tag = string
type Size = "T" | "S" | "M" | "L" | "H" | "G"

type Resistances = { resist: string[], note: string, cond: boolean, preNote?: string }
type Immunities = { immune: string[], note: string, cond: boolean, preNote?: string }

type Creature = {
    name: string,
    group?: string,
    source: string,
    page: number,
    otherSources?: { source: string }[],
    size: Size,
    type: string | { type: string, tags?: string[], swarmSize?: Size },
    alignment: (string | { alignment: string[], chance: number })[],
    ac: (number | { ac: number, from?: string[], condition?: string, [other: string]: any })[],
    hp: { average: number, formula: string },
    speed: { [type in Speed]?: number | { number: number, condition: string } } & ({ canHover?: boolean }),
    str: number,
    dex: number,
    con: number,
    int: number,
    wis: number,
    cha: number,
    passive: number,
    cr: string | { cr: string, [cond: string]: string },

    srd?: boolean, //Is this creature part of the SRD

    save?: { [type in Stat]?: string },
    skill?: { [type in Skill]?: string },
    senses?: string[],
    resist?: (string | { special: string } | Resistances)[],
    immune?: (string | { special: string } | Immunities)[],
    languages?: string[],
    spellcasting?: Spellcasting[],
    trait?: ExtText[],
    action?: ExtText[],
    legendary?: ExtText[],

    senseTags?: Tag[],
    actionTags?: Tag[],
    languageTags?: Tag[],
    damageTags?: Tag[],
    miscTags?: Tag[],

    [otherKey: string]: any
}

const proficiencyBonus = {
    "0": 2, "1/8": 2, "1/4": 2, "1/2": 2,
    "1": 2, "2": 2, "3": 2, "4": 2,
    "5": 3, "6": 3, "7": 3, "8": 3,
    "9": 4, "10": 4, "11": 4, "12": 4,
    "13": 5, "14": 5, "15": 5, "16": 5,
    "17": 6, "18": 6, "19": 6, "20": 6,
    "21": 7, "22": 7, "23": 7, "24": 7,
    "25": 8, "26": 8, "27": 8, "28": 8,
    "29": 9, "30": 9
}

const parseEntry = (entry: string) => {
    const re = new RegExp(/\{\@([a-z]+) ([\w\s]+)\}/, 'g')

    for (let [full, arg, param] of entry.matchAll(re)) {


        console.log(arg, param)
    }
}

type BlockCommand = 'dc' | 'b' | 'i' | 'damage' | 'recharge' | 'book' | 'condition'
    | 'h' | 'atk' | 'spell' | 'skill' | 'item' | 'creature' | 'chance' | 'hit' | 'dice'

const attackType: { [type: string]: string } = {
    'mw': 'Melee Weapon Attack',
    'rw': 'Ranged Weapon Attack',
    'ms': 'Melee Spell Attack',
    'rs': 'Ranged Spell Attack'
}
const renderBlock = (command: BlockCommand, parameter: string): string => {
    switch (command) {
        case "b":
            return `<b>${parameter}</b>`
        case "i":
            return `<i>${parameter}</i>`
        case "spell":
        case "condition":
        case "item":

        case "recharge":
        case "hit":
        case "spell":
        case "skill":
            return `<span class="${command}">${parameter}</span>`
        case "dc":
            return `<span class="${command}">DC ${parameter}</span>`
        case "damage":
        case "dice":
            return `${parameter}`
        case "creature":
            return `<span class="creature">${parameter}</span>`
        case "atk":
            return attackType[parameter]
        case "chance":
            return `<span class="chance">${parameter}</span>`
        case "h":
        case "book":
        default:
            return parameter
    }
}

