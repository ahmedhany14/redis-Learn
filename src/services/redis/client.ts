import { createClient, defineScript } from 'redis';

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,
	scripts: {
		// name of the script
		addOneAndStore: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `return redis.call('SET', KEYS[1], ARGV[1] + 1)`,
			transformArguments(key: string, value: number) {
				return [key, value.toString()];
			},
			transformReply(reply: any) {
				return reply;
			}
		})
	}
});

client.on('connect', async () => {
	console.log('Connected to Redis');
	await client.addOneAndStore('test', 1);
	const value = await client.get('test');
	console.log(value);
});

client.on('error', (err) => console.error(err));
client.connect();

export { client };
