export declare type Runner<T> = () => Promise<T | null>;
export declare function executeRunners<T>(runners: Runner<T>[]): Promise<T | null>;
//# sourceMappingURL=runner.d.ts.map