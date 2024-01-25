export enum Roles {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export type User = {
    id: number,
    username: string,
    name: string,
    password: string,
    fb: string
    auth: string,
    role: Roles,
    image: number
}
const userDB: User[] = [
    { id: 1, username: 'tom', name: 'Tom', fb: 'TV', password: 'test', auth: 'madeupsessionidfortom', role: Roles.ADMIN, image: 1205 },
    { id: 2, username: 'otheruser', name: 'Other User', fb: 'OU', password: 'test', auth: 'madeupsessionidforotheruser', role: Roles.USER, image: 1208 },
    { id: 3, username: 'richard', name: 'Richard Harris', fb: 'RH', password: 'test', auth: 'madeupsessionidforrichard', role: Roles.USER, image: 1068 },
]

const findUnique = (username: string): User | undefined => {
    return userDB.find(user => user.username.toLocaleLowerCase() == username.toLocaleLowerCase())
}

export const validateUsername = (username: string) => {
    return findUnique(username)?.username
}

export const getAuthToken = (username: string): string | undefined => {
    return findUnique(username)?.auth
}

export const getUserByAuth = (authToken: string) => {
    let user = userDB.find(user => user.auth === authToken)
    if (!user) return undefined
    return { name: user.name, username: user.username, role: user.role, id: user.id, fb: user.fb, image: user.image }
}

export const isPasswordCorrect = (username: string, password: string) => {
    let user = findUnique(username)
    if (!user) return false
    return user.password === password
}