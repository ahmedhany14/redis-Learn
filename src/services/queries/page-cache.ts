import { client } from "$services/redis";
import { pageKeys } from "$services/keys";
const cacheRoutes = [
    '/about',
    "/privacy",
    "/auth/signin",
    "/auth/signup",
];

export const getCachedPage = (route: string) => {
    if (cacheRoutes.includes(route)) { // return cached page if route is in cacheRoutes
        //console.log(`Getting cached page for ${route}`);
        const cachedPage = client.get(pageKeys(route));
        return cachedPage;
    }
    return null; // return null if route is not in cacheRoutes
};

export const setCachedPage = (route: string, page: string) => {
    if (cacheRoutes.includes(route)) { // set cached page if route is in cacheRoutes
        // console.log(`Setting cached page for ${route}`);
        return client.set(pageKeys(route), page, {
            EX: 10, // expire in 10 seconds
        });
    }
};
