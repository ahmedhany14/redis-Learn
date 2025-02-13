import { client } from '$services/redis';

export const withLock = async (key: string, cd: (signal: any) => any) => {
	// implementation of the lock

	//1. initialize timeout and retry count
	const timeout = 50,
		retry = 10; // will wait for 100ms
	const total_timeout = timeout * retry;
	const token = 'used'; // generate a random token to identify the lock
	const lock_key = `lock#${key}`;

	for (let i = 0; i < retry; i++) {
		//2. you try to acquire the lock, if you can't acquire it, you will wait for the timeout and try again.
		// if (!client.isOpen) {
		// 	console.log('Redis is not connected');
		// 	await client.connect();
		// }
		const acquired = await client.set(lock_key, token, {
			NX: true, // set the lock if it doesn't exist, return false if it exists
			PX: total_timeout // set the expiration time in milliseconds
			//EX: total_timeout // set the expiration time in seconds
			/*
			Note: we should use one of them (PX or EX) to set the expiration time
			 */
		});
		console.log(acquired);
		if (acquired) {
			try {
				/*
					I will add some logic to make sure that the callback function will not take more than total_timeout
			 */
				const signal = { expierd: false };

				setTimeout(() => {
					signal.expierd = true;
				}, total_timeout);

				return await cd(signal);
			} finally {
				// convert the unlocking to a lua script
				await client.unlock(lock_key, token);
			}
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
