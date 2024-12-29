import { client } from '$services/redis';
import type { Session } from '$services/types';
import { sessionKeys } from '$services/keys';

export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionKeys(id));
    if (Object.keys(session).length === 0) {
        console.log('No session found', id);
        return null;
    }
    return deserialization(session, id);
};

export const saveSession = async (session: Session) => {
    return await client.hSet(sessionKeys(session.id), serialization(session));
};

function serialization(session: Session) {
    return {
        userId: session.userId || '',
        username: session.username,
    }
}

function deserialization(session: any, id: string) {
    return {
        id,
        userId: session.userId || '',
        username: session.username,
    }
}