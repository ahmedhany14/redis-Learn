import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { userKeys, userNameKey, usernameKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	let id = (await client.zScore(usernameKey(), username))?.toString(16);
	const user = await client.hGetAll(userKeys(id));

	if (Object.keys(user).length === 0) return null;

	return deserialization(user, id);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(userKeys(id)); // will return an object with the user's data
	return deserialization(user, id);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();
	const is_member = await client.sIsMember(userNameKey(), attrs.username);

	if (is_member) throw new Error('Username already exists');
	await client.sAdd(userNameKey(), attrs.username);
	await client.hSet(userKeys(id), serialization(attrs));

	// create a username sorted set to store the user's name and id
	await client.zAdd(usernameKey(), {
		value: attrs.username,
		score: parseInt(id, 16)
	});

	return id;
};

function serialization(user: CreateUserAttrs) {
	return {
		username: user.username,
		password: user.password
	};
}

function deserialization(user: any, id: string) {
	return {
		id,
		username: user.username,
		password: user.password
	};
}
