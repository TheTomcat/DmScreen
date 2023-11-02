// place files you want to import through the `$lib` alias in this folder.
import type { RollMode } from "../app";

export const roll = (dice: string, mode: RollMode = 'default'): number => {
    const re = /(\d+)d(\d+)\s*\+\s*(\d+)/;
    const components = dice.match(re);
    if (!components) return 0;
    let n = parseInt(components[1]);
    let d = parseInt(components[2]);
    let c = parseInt(components[3]);
    switch (mode) {
        case 'default':
            return Math.floor((n * (d + 1)) / 2 + c);
        case 'random':
            return Array(n)
                .fill(1)
                .map(() => Math.floor(Math.random() * d + 1))
                .reduce((a, b) => a + b);
        case 'min':
            return n + c;
        case 'max':
            return n * d + c;
        case 'one':
            return 1;
    }
};