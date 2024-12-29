import { client } from '$services/redis';
import { genId } from '$services/utils';
import { itemKeys } from '$services/keys';

import type { CreateItemAttrs } from '$services/types';
import { DateTime } from 'luxon';

export const getItem = async (id: string) => {
    const key = itemKeys(id);
    const item = await client.hGetAll(key);
    if (Object.keys(item).length === 0) {
        console.log('No item found', id);
        return null;
    }
    console.log('Item found', deserialization(item, id));
    return deserialization(item, id);
};

export const getItems = async (ids: string[]) => {

    let results = await Promise.all(ids.map(async (id) => {
        return await getItem(id);
    }));

    results = results.filter((item) => item !== null);
    return results;
};

export const createItem = async (attrs: CreateItemAttrs) => {
    const id = genId();
    const item = serialization(attrs);
    await client.hSet(itemKeys(id), item);
    return id;
};


const serialization = (item: CreateItemAttrs) => {
    return {
        ...item,
        createdAt: item.createdAt.toMillis(),
        endingAt: item.endingAt.toMillis(),
    }
}

function deserialization(item: any, id: string) {
    return {
        id,
        name: item.name,
        imageUrl: item.imageUrl,
        description: item.description,
        createdAt: DateTime.fromMillis(parseInt(item.createdAt)),
        endingAt: DateTime.fromMillis(parseInt(item.endingAt)),
        ownerId: item.ownerId,
        highestBidUserId: item.highestBidUserId,
        status: item.status,
        price: parseInt(item.price),
        views: parseInt(item.views),
        likes: parseInt(item.likes),
        bids: parseInt(item.bids),
    }
}