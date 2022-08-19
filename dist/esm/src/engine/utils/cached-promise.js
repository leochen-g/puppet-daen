const PromiseCache = new Map();
export async function CachedPromise(key, promise) {
    const cache = PromiseCache.get(key);
    if (cache) {
        return cache;
    }
    PromiseCache.set(key, promise);
    return promise.finally(() => PromiseCache.delete(key));
}
export async function CachedPromiseFunc(key, promiseFunc) {
    const cache = PromiseCache.get(key);
    if (cache) {
        return cache;
    }
    const promise = promiseFunc();
    PromiseCache.set(key, promise);
    return promise.finally(() => PromiseCache.delete(key));
}
//# sourceMappingURL=cached-promise.js.map