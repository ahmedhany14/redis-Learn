import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { userKeys, userNameKey } from '$services/keys';


export const getUserByUsername = async (username: string) => { };

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(userKeys(id)); // will return an object with the user's data
    return deserialization(user, id);
};

export const createUser = async (attrs: CreateUserAttrs) => {
    const id = genId();
    const is_member = await client.sIsMember(userNameKey(), attrs.username);

    if(is_member) throw new Error('Username already exists');
    await client.sAdd(userNameKey(), attrs.username);
    await client.hSet(userKeys(id), serialization(attrs));

    return id;
};

function serialization(user: CreateUserAttrs) {
    return {
        username: user.username,
        password: user.password,
    }
}

function deserialization(user: any, id: string) {
    return {
        id,
        username: user.username,
        password: user.password,
    }

}