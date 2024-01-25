import type { Handle, ResolveOptions } from '@sveltejs/kit';
import { getUserByAuth } from '$lib/auth'

export const handle: Handle = async ({ event, resolve }) => {
    const resolveOptions: ResolveOptions = {
        transformPageChunk: ({ html }) => html.replace('old', 'new'),
        filterSerializedResponseHeaders: (name) => name.startsWith('x-') || name == "content-length" || name == 'content-type',
        preload: ({ type, path }) => type === 'js' || path.includes('/important/'),
    }


    const session = event.cookies.get('session')
    // console.log(session)
    if (!!session) {
        const user = getUserByAuth(session)
        // if `user` exists set `events.local`
        if (user) {
            event.locals.user = {
                image: user.image,
                name: user.name,
                role: user.role,
                fb: user.fb,
                username: user.username
            }
            // console.log("User found")
        } else {
            // console.log("unauthenticated")
        }
    }

    return await resolve(event, resolveOptions);



    // get cookies from browser

    // find the user based on the session
    // const user = await db.user.findUnique({
    //     where: { userAuthToken: session },
    //     select: { username: true, role: true },
    // })

    // load page as normal
    // return await resolve(event)
}
