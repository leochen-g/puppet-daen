"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedPromiseFunc = exports.CachedPromise = void 0;
const PromiseCache = new Map();
async function CachedPromise(key, promise) {
    const cache = PromiseCache.get(key);
    if (cache) {
        return cache;
    }
    PromiseCache.set(key, promise);
    return promise.finally(() => PromiseCache.delete(key));
}
exports.CachedPromise = CachedPromise;
async function CachedPromiseFunc(key, promiseFunc) {
    const cache = PromiseCache.get(key);
    if (cache) {
        return cache;
    }
    const promise = promiseFunc();
    PromiseCache.set(key, promise);
    return promise.finally(() => PromiseCache.delete(key));
}
exports.CachedPromiseFunc = CachedPromiseFunc;
//# sourceMappingURL=cached-promise.js.map