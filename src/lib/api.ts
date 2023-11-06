import type { ApiResponse, Tag, Image, Message, ImageMatch, Session, Entity, Participant, Combat } from "../app";

function catchError<T>(response: ApiResponse<T>): T {
    if (response.response === "OK") {
        return response.payload;
    } else if (response.response === "Fail") {
        throw new Error(response.error_message);
    } else {
        throw new Error("A random error occurred")
    }
}

async function apiCall<T>(fetch: Function, url: string, method: string = "GET", payload: object = {}): Promise<T> {
    let options = {
        method,
        body: (method === "GET") ? undefined : JSON.stringify(payload),
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    };

    try {
        const response = await fetch(url, options);
        return catchError<T>(await response.json());
    } catch (error) {
        console.log(error);
        throw new Error("error");
    }
}

export function apiGetAllTags(fetch: Function): Promise<Tag[]> {
    return apiCall(fetch, '/api/tags')
}

export function apiCreateNewTag(fetch: Function, tag: { tag: string }): Promise<Tag> {
    return apiCall(fetch, '/api/tags', "POST", tag)
}

export function apiApplyTagIdToImage(fetch: Function, image_id: number, tag_id: number): Promise<Image> {
    return apiCall(fetch, `/api/image/${image_id}/tag/${tag_id}`, "PUT")
}

export function apiRemoveTagIdFromImage(fetch: Function, image_id: number, tag_id: number): Promise<Image> {
    return apiCall(fetch, `/api/image/${image_id}/tag/${tag_id}`, "DELETE")
}


export function apiGetTagsOfImage(fetch: Function, image_id: number): Promise<Tag[]> {
    return apiCall(fetch, `/api/image/${image_id}/tag`)
}

export function apiApplyTagToImage(fetch: Function, image_id: number, tag_name: string): Promise<Image> {
    return apiCall(fetch, `/api/image/${image_id}/tag/${tag_name}`, "POST")
}

export function apiSetImageFocalPoint(fetch: Function, image_id: number, focus_x: number, focus_y: number): Promise<Image> {
    return apiCall(fetch, `/api/image/${image_id}/focus?x=${focus_x}&y=${focus_y}`, "POST")

}

export function apiRemoveTagFromImage(fetch: Function, image_id: number, tag_name: string): Promise<Image> {
    return apiCall(fetch, `/api/image/${image_id}/tag/${tag_name}`, "DELETE")
}

export function apiGetRandomImage(fetch: Function): Promise<Image> {
    return apiCall(fetch, `/api/image/random`)
}

export function apiGetMessageById(fetch: Function, message_id: number): Promise<Message> {
    return apiCall(fetch, `/api/message/${message_id}`)

}

export function apiGetAllMessages(fetch: Function): Promise<Message[]> {
    return apiCall(fetch, `/api/message`)
}

export function apiGetRandomMessage(fetch: Function): Promise<Message> {
    return apiCall(fetch, `/api/message/random`)
}

export function apiCreateNewMessage(fetch: Function, message: string): Promise<Message> {
    return apiCall(fetch, `/api/message`, "POST", { message })
}

export function apiGetImageById(fetch: Function, image_id: number): Promise<Image> {
    return apiCall(fetch, `/api/image/${image_id}`)

}

export function apiGetImageTagMatch(fetch: Function, taglist: number[]): Promise<ImageMatch> {
    return apiCall(fetch, `/api/image?tags=${taglist.join(',')}`)

}

export function apiGetSession(fetch: Function, session_id: number): Promise<Session> {
    return apiCall(fetch, `/api/session/${session_id}`)
}

export function apiGetAllSessions(fetch: Function): Promise<Session[]> {
    return apiCall(fetch, `/api/session`)
}

export function apiCreateSession(fetch: Function, image_id: number, message_id: number): Promise<Session> {
    return apiCall(fetch, `/api/session?image=${image_id}&message=${message_id}`, "POST")
}

export function apiGetAllEntities(fetch: Function): Promise<Entity[]> {
    return apiCall(fetch, `/api/entity`)
}

export function apiGetEntity(fetch: Function, entity_id: number): Promise<Entity> {
    return apiCall(fetch, `/api/entity/${entity_id}`)
}

export function apiGetAllParticipants(fetch: Function): Promise<Participant[]> {
    return apiCall(fetch, `/api/participant`)
}

export function apiGetParticipant(fetch: Function, participant_id: number): Promise<Participant> {
    return apiCall(fetch, `/api/participant/${participant_id}`)
}

export function apiAddParticipantToCombat(fetch: Function, participant: Partial<Participant>): Promise<Participant> {
    return apiCall(fetch, '/api/combat/participant', "PUT", participant)
}

export function apiRemoveParticipantFromCombat(fetch: Function, participant: Partial<Participant>) {
    return apiCall(fetch, '/api/combat/participant', "DELETE", participant)
}

export function apiModifyParticipant(fetch: Function, participant: Partial<Participant>): Promise<Participant> {
    return apiCall(fetch, '/api/combat/participant', "PATCH", participant)
}

export function apiGetAllCombats(fetch: Function): Promise<Combat[]> {
    return apiCall(fetch, `/api/combat`)
}

export function apiGetCombat(fetch: Function, combat_id: number): Promise<Combat> {
    return apiCall(fetch, `/api/combat/${combat_id}`)
}

export function apiCreateCombat(fetch: Function, title: string): Promise<Combat> {
    return apiCall(fetch, `/api/combat`, "POST", { title })
}

export function apiCreateNewEntity(fetch: Function, entity: Partial<Entity>): Promise<Entity> {
    return apiCall(fetch, `/api/entity`, "PUT", entity)
}

export function apiModifyEntity(fetch: Function, entity: Partial<Entity>): Promise<Entity> {
    return apiCall(fetch, `/api/entity`, "PATCH", entity)
}