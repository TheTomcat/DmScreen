import { User, Cat, Image, ImageOff, Subtitles } from 'lucide-svelte';


export const pcTypes = [
    { value: 'pc', label: 'PC', icon: User },
    { value: 'npc', label: 'NPC', icon: Cat }
] as const;
export type pcType = (typeof pcTypes)[number]['value'];

export const hasImage = [
    { value: 'image', label: 'Has Image', icon: Image },
    { value: 'noimage', label: 'No Image', icon: ImageOff }
] as const;
export type hasImageType = (typeof hasImage)[number]['value'];

export const hasData = [
    { value: 'data', label: 'Has Data', icon: Subtitles },
    { value: 'nodata', label: 'No Data', icon: Subtitles }
] as const;
export type hasDataType = (typeof hasData)[number]['value'];

export const CRList = [
    "1/8", "1/4", "1/2", "1",
    "2", "3", "4", "5", "6", "7", "8",
    "9", "10", "11", "12", "13", "14",
    "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26",
    "27", "28", "29", "30"
] as const;
export type CRType = typeof CRList[number];
export const CR = CRList.map(c => { return { value: c, label: c, icon: undefined } });