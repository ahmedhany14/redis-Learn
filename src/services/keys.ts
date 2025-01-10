export const pageKeys = (id: string) => `pagecached:${id}`;
export const userKeys = (id: string) => `users:${id}`;
export const sessionKeys = (id: string) => `session:${id}`;
export const userNameKey = () => `username:unique`;
export const userLikedItems = (id: string) => `user:${id}:likes`;
export const usernameKey = () => `username`;

// items
export const itemKeys = (id: string) => `items:${id}`;
export const itemsKeyByView = () => `items:views`;
export const itemKeyEndAt = () => `items:endAt`;
export const itemsKeView = (id: string) => `items:views${id}`;