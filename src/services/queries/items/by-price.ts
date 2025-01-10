import {client} from '$services/redis';
import { itemKeys, itemsKeyByPrice } from '$services/keys';

import {getItems} from '$services/queries/items';
export const itemsByPrice = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	const data = await client.sort(itemsKeyByPrice(), {
		GET: '#',
		BY:`${itemKeys('*')}->price`,
		DIRECTION: order,
		LIMIT: {
			offset,
			count
		}
	}) as string[];

	return await getItems(data);
};
