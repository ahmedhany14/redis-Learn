export const pageKeys = (id: string) => `pagecached:${id}`;
export const userKeys = (id: string) => `users:${id}`;
export const sessionKeys = (id: string) => `session:${id}`;
export const itemKeys = (id: string) => `items:${id}`;
export const userNameKey = () => `username:unique`;
export const userLikedItems = (id: string) => `user:${id}:likes`;
export const usernameKey = () => `username`;