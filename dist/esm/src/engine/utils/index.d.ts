/// <reference types="node" />
/**
 * 延时函数
 * @param {*} ms 毫秒
 */
export declare function delay(ms: number): Promise<void>;
/**
 * 上传文件
 */
export declare function putFileTransfer(fileName: string, fileData: Buffer): Promise<string>;
/**
 * 获取带后缀的文件名
 * @param path
 */
export declare function getFileName(path: string): string;
//# sourceMappingURL=index.d.ts.map