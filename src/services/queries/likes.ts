import { userLikedItems, itemKeys } from '$services/keys';
import { client } from '$services/redis';
import {getItems} from '$services/queries/items/items';

export const userLikesItem = async (itemId: string, userId: string) => {
	const isLiked = await client.sIsMember(userLikedItems(userId), itemId);
	return !!isLiked;
};

export const likedItems = async (userId: string) => {
	const itemsId = await client.sMembers(userLikedItems(userId)); // get all items liked by user
	return getItems(itemsId);
};

export const likeItem = async (itemId: string, userId: string) => {
	if (await client.sIsMember(userLikedItems(userId), itemId)) return;
	await client.sAdd(userLikedItems(userId), itemId);
	return await client.hIncrBy(itemKeys(itemId), 'likes', 1);
};

export const unlikeItem = async (itemId: string, userId: string) => {
	if (!(await client.sIsMember(userLikedItems(userId), itemId))) return;
	await client.sRem(userLikedItems(userId), itemId);
	return await client.hIncrBy(itemKeys(itemId), 'likes', -1);
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
	const itemsIntersectionIds = await client.sInter([userLikedItems(userOneId), userLikedItems(userTwoId)]);
	return getItems(itemsIntersectionIds);
};
