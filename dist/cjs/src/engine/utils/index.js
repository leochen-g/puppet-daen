"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileName = exports.putFileTransfer = exports.delay = void 0;
const axios_1 = __importDefault(require("axios"));
const url_1 = require("url");
/**
 * 延时函数
 * @param {*} ms 毫秒
 */
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
/**
 * 上传文件
 */
async function putFileTransfer(fileName, fileData) {
    const res = await axios_1.default.put(`https://transfer.sh/${fileName}`, fileData);
    if (res.data) {
        const parseUrl = new url_1.URL(res.data);
        return parseUrl.origin + '/get' + parseUrl.pathname;
    }
    return '';
}
exports.putFileTransfer = putFileTransfer;
/**
 * 获取带后缀的文件名
 * @param path
 */
function getFileName(path) {
    const pos1 = path.lastIndexOf('/');
    const pos2 = path.lastIndexOf('\\');
    const pos = Math.max(pos1, pos2);
    if (pos < 0) {
        return path;
    }
    else {
        return path.substring(pos + 1);
    }
}
exports.getFileName = getFileName;
//# sourceMappingURL=index.js.map