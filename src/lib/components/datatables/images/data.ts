import { PlusCircle, Check, MapPinned, Scroll, User, Image } from 'lucide-svelte';
export const imageTypes = [
    { value: 'character', label: 'Character', icon: User },
    { value: 'map', label: 'Map', icon: MapPinned },
    { value: 'handout', label: 'Handout', icon: Scroll },
    { value: 'backdrop', label: 'Backdrop', icon: Image }
] as const;