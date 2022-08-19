export declare type RegexHandler<T> = (matchedRegexIndex: number, match: RegExpMatchArray) => Promise<T>;
export declare function parseTextWithRegexList<T>(text: string, regexList: RegExp[], handler: RegexHandler<T>): Promise<T | null>;
//# sourceMappingURL=regex.d.ts.map