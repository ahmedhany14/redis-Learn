import type { CreateBidAttrs, Bid } from '$services/types';
import { client, withLock } from '$services/redis';
import { bidHistoryKeys, itemKeys, itemsKeyByPrice } from '$services/keys';
import { DateTime } from 'luxon';
import { getItem } from '$services/queries/items';

/*
Here is a big issue in creating bids, which is the concurrency issue
which means if there are 2 users trying to bid on the same item at the same time, all the bids will be accepted

to solve this, we will use transactions in redis, which will make sure that the bids are created in order

we will watch the item key, and if the item has changed, we will abort the transaction

transaction steps:
 watch the item we want to track
 get the data
 start the transaction
 set the new data
 execute the transaction
 */

/*

LOCKS

As you know, we solve concurrency issues using transactions, but what if we have a lot of transactions at the same time.
This will lead to a lot of transactions being aborted and re-executed, which is not efficient.
This will lead us to miss many bids, and the user will not be able to bid on the item.

So we will use locks to solve this issue.
Which means that we will lock the item key when we start the transaction, and we will unlock it when we finish the transaction.

But how locks work in Redis?
1. you declare the lock key, the number of retries and the timeout that the lock will be released after.
2. you try to acquire the lock, if you can't acquire it, you will wait for the timeout and try again.
3. you will start the transaction and execute the commands.
4. you will release the lock.

 */

export const createBid = async (attrs: CreateBidAttrs) => {
	// implementation of the lock
	return withLock(attrs.itemId, async (signal: any) => {
		// first, we will fetch the item to check if it exists
		const item = await getItem(attrs.itemId);

		// do some validations
		if (!item) throw new Error('Item not found');

		console.log(item.price, attrs.amount);
		if (item.price >= attrs.amount)
			throw new Error('Bid amount should be greater than the current price');

		if (item.endingAt.diff(DateTime.now()).toMillis() < 0)
			throw new Error('Item has already ended');
		// update the item with the new bid
		const key = bidHistoryKeys(attrs.itemId);
		const value = seralizeBid(attrs);

		// await pause(5000)
		// check signal if the transaction is expired
		if (signal.expierd) throw new Error('lock expired');

		// create the bid if everything is okay
		return Promise.all([
			client.rPush(key, value),
			client.hSet(itemKeys(item.id), {
				highestBidUserId: attrs.userId,
				price: attrs.amount,
				bids: item.bids + 1
			}),
			client.zAdd(itemsKeyByPrice(), {
				value: item.id,
				score: attrs.amount
			})
		]);
	});

	/*	return client.executeIsolated(async (isolatedClient) => {
			// watch the item key
			await isolatedClient.watch(itemKeys(attrs.itemId));
	
			const item = await getItem(attrs.itemId);
	
			if (!item) throw new Error('Item not found');
	
			if (item.price >= attrs.amount)
				throw new Error('Bid amount should be greater than the current price');
	
			if (item.endingAt.diff(DateTime.now()).toMillis() < 0)
				throw new Error('Item has already ended');
	
			client.multi();
			// update the item with the new bid
	
			const key = bidHistoryKeys(attrs.itemId);
	
			const value = seralizeBid(attrs);
	
			// await Promise.all([
			// 	client.rPush(key, value),
			// 	client.hSet(itemKeys(item.id), {
			// 		highestBidUserId: attrs.userId,
			// 		price: attrs.amount,
			// 		bids: item.bids + 1
			// 	})
			// ]);
	
			// start the transaction and execute the commands
			return isolatedClient
				.multi()
				.rPush(key, value)
				.hSet(itemKeys(item.id), {
					highestBidUserId: attrs.userId,
					price: attrs.amount,
					bids: item.bids + 1
				})
				.zAdd(itemsKeyByPrice() , {
					value: item.id,
					score: attrs.amount
				})
				.exec();
	
			// write this script in the browser console to test the concurrency issue
	
			// for(let i = 0; i < 100; i++) {
			// 	$0click();
			// }
		});*/
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const key = bidHistoryKeys(itemId);
	const data = await client.lRange(key, 0, await client.lLen(key));
	return data.map((items) => deserializeBid(items));
};

function seralizeBid(bid: CreateBidAttrs): string {
	const value = `${bid.userId}:${bid.amount}:${bid.createdAt.toMillis()}`;
	return value;
}

function deserializeBid(bid: string): any {
	const [userid, amount, time] = bid.split(':');

	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(time))
	};
}

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
