import { fail, redirect } from '@sveltejs/kit'
import type { Action, Actions, PageServerLoad } from './$types'


import { setError, superValidate } from "sveltekit-superforms/server"
import { loginFormSchema } from '$lib/formSchemas'

import { getAuthToken, isPasswordCorrect, validateUsername } from '$lib/auth'

export const load: PageServerLoad = async (event) => {
    return {
        form: await superValidate(event, loginFormSchema)
    }
}

const login: Action = async (event) => {
    const form = await superValidate(event, loginFormSchema);

    if (!form.valid) {
        return fail(400, {
            form
        });
    }

    const username = validateUsername(form.data.username);
    if (!username || !isPasswordCorrect(username, form.data.password)) {
        return setError(form, 'password', 'Incorrect credentials')
    }

    const authToken = getAuthToken(username);
    if (!authToken) return fail(400, { credentials: true, form })
    // const user = await db.user.findUnique({ where: { username } })

    // if (!user) {
    //     return fail(400, { credentials: true })
    // }

    // const userPassword = await bcrypt.compare(password, user.passwordHash)

    // if (!userPassword) {
    //     return fail(400, { credentials: true })
    // }

    // generate new auth token just in case
    // const authenticatedUser = await db.user.update({
    //     where: { username: user.username },
    //     data: { userAuthToken: crypto.randomUUID() },
    // })

    // cookies.set('session', authenticatedUser.userAuthToken, {
    event.cookies.set('session', authToken, {
        // send cookie for every page
        path: '/',
        // server side only cookie so you can't use `document.cookie`
        httpOnly: true,
        // only requests from same site can send cookies
        // https://developer.mozilla.org/en-US/docs/Glossary/CSRF
        sameSite: 'strict',
        // only sent over HTTPS in production
        secure: process.env.NODE_ENV === 'production',
        // set cookie to expire after a month
        maxAge: 60 * 60 * 24 * 30,
    })

    // redirect the user
    // console.log("success")
    throw redirect(302, '/')
}

export const actions: Actions = {
    login,

}
