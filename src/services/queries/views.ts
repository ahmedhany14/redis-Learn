import {
	client
} from '$services/redis';

/*
why do we use hyperloglog to count views and not use sets?

lets imaging have an item with 1 million views if we use sets to store the views.
for each view, we will add the user id to the set, the id stored in about 40 bytes.
so for 1 million views, we will store about 40MB of data.

but with hyperloglog we can store the views with a constant size of 12KB, no matter how many views we have.
 */
export const incrementView = async (itemId: string, userId: string) => {
	// increment the view count of the item, increment the view item in an ordered set
	/*
	const not_viewed = await  client.pfAdd(itemsKeView(itemId), userId);
	if (!not_viewed) return;
	await Promise.all([
		client.hIncrBy(itemKeys(itemId), 'views', 1),
		client.zIncrBy(itemsKeyByView(), 1, itemId)
	]);*/

	// convert the function to a lua script

	await client.incrementView(itemId, userId);

};

/*
we will convert this function to a lua script to make it atomic

1) keys I will use:
	items:views${itemId} (hyperloglog) -> to store the views of the item
	items:${itemId} (hash) -> to increment the views of the item in the hash of the item
	items:views (sorted set) -> increment the views of the item in the sorted set

2) arguments I will use:
	itemId: the id of the item
	userId: the id of the user who viewed the item
 */
