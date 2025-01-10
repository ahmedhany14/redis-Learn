import {
	client
} from '$services/redis';

import {
	itemKeys,
	itemsKeyByView,
	itemsKeView
} from '$services/keys';


/*
why do we use hyperloglog to count views and not use sets?

lets imaging have an item with 1 million views if we use sets to store the views.
for each view, we will add the user id to the set, the id stored in about 40 bytes.
so for 1 million views, we will store about 40MB of data.

but with hyperloglog we can store the views with a constant size of 12KB, no matter how many views we have.
 */
export const incrementView = async (itemId: string, userId: string) => {
	// increment the view count of the item, increment the view item in an ordered set
	const not_viewed = await  client.pfAdd(itemsKeView(itemId), userId);
	if (!not_viewed) return;
	await Promise.all([
		client.hIncrBy(itemKeys(itemId), 'views', 1),
		client.zIncrBy(itemsKeyByView(), 1, itemId)
	]);
};
