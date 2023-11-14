import { writable } from "svelte/store";
import type { Message } from "../../app";
import { apiGetAllMessages } from "$lib/api";

export const allMessages = writable<Message[]>([]);

export async function getMessages() {
    const messages = await apiGetAllMessages();
    console.log(messages);
    allMessages.set(messages);
}

