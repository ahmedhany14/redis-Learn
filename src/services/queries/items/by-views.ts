import { client } from '$services/redis';
import { itemsKeyByView, itemKeys } from '$services/keys';
import { getItems } from '$services/queries/items/items';

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	/*const ids = await client.zRange(itemsKeyByView(), 0, '+inf', {
		BY: 'SCORE',
		LIMIT: {
			offset,
			count
		}
	});*/

	const ids = (await client.sort(itemsKeyByView(), {
		GET: ['#'],
		BY: `${itemKeys('*')}->views`,
		DIRECTION: order, // DESC or ASC
		LIMIT: {
			offset: offset,
			count: count
		}
		//ALPHA: true // if ids are strings, you want to sort them alphabetically
	})) as string[];
	return await getItems(ids);
};
