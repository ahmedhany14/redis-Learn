import { createClient, defineScript } from 'redis';

import { itemKeys, itemsKeyByView, itemsKeView } from '$services/keys';

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
		}),
		incrementView: defineScript({
			NUMBER_OF_KEYS: 3,
			SCRIPT: `
			local itemKeys = KEYS[1]
			local itemsKeyByView = KEYS[2]
			local itemsKeView = KEYS[3]
			
			local itemId = ARGV[1]
			local userId = ARGV[2]
			
			local not_viewed = redis.call('PFADD', itemsKeView, userId)
			
			if not_viewed == 1 then
				redis.call('HINCRBY', itemKeys, 'views', 1)
				redis.call('ZINCRBY', itemsKeyByView, 1, itemId)
			end
			
			`,
			transformArguments(itemId: string, userId: string) {
				return [itemKeys(itemId), itemsKeyByView(), itemsKeView(itemId), itemId, userId];
			},
			transformReply(reply: any) {
				return reply;
			}
		})
	}
});

client.on('error', (err) => console.error(err));
client.connect();

export { client };
