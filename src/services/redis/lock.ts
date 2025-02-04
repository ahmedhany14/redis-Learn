import { client } from '../../../worker/client';

export const withLock = async (key: string, cd: () => any) => {
	// implementation of the lock

	//1. initialize timeout and retry count
	const timeout = 50, retry = 10; // will wait for 100ms
	const total_timeout = timeout * retry;
	const token = 'used'; // generate a random token to identify the lock
	const lock_key = `lock#${key}`;


	for (let i = 0; i < retry; i++) {
		//2. you try to acquire the lock, if you can't acquire it, you will wait for the timeout and try again.
		const acquired = await client.set(lock_key, token, {
			NX: true, // set the lock if it doesn't exist, return false if it exists
			PX: total_timeout, // set the expiration time in milliseconds
			//EX: total_timeout // set the expiration time in seconds
			/*
			Note: we should use one of them (PX or EX) to set the expiration time
			 */
		});
		if (acquired) {
			await client.del(lock_key);
			return await cd();
		}

		await pause(timeout);
	}
};

const buildClientProxy = () => {};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
