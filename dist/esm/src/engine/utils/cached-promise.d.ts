export declare function CachedPromise<T>(key: string, promise: Promise<T>): Promise<T>;
declare type PromiseFunc<T> = () => Promise<T>;
export declare function CachedPromiseFunc<T>(key: string, promiseFunc: PromiseFunc<T>): Promise<T>;
export {};
//# sourceMappingURL=cached-promise.d.ts.map