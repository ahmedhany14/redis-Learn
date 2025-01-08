import { client } from '$services/redis';
import { itemKeyEndAt } from '$services/keys';
import { getItems } from '$services/queries/items/items';

export const itemsByEndingTime = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	const ids = await client.zRange(itemKeyEndAt(), Date.now(), '+inf', {
		BY: 'SCORE',
		LIMIT: {
			offset,
			count
		}
	});

	const items = await getItems(ids);

	// items.map((item) => {
	// 	console.log(item.views);
	// })

	return order === 'ASC' ? items : items.reverse();
};
