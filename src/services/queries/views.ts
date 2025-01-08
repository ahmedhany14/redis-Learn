import {
	client
} from '$services/redis';

import {
	itemKeys,
	itemsKeyByView
} from '$services/keys';

export const incrementView = async (itemId: string, userId: string) => {
	// increment the view count of the item, increment the view item in ordered set
	await Promise.all([
		client.hIncrBy(itemKeys(itemId), 'views', 1),
		client.zIncrBy(itemsKeyByView(), 1, itemId)
	]);
};
