import axios from 'axios'
import { URL } from 'url'

/**
 * 延时函数
 * @param {*} ms 毫秒
 */
export async function delay (ms:number):Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 上传文件
 */
export async function putFileTransfer (fileName: string, fileData: Buffer): Promise<string> {
  const res = await axios.put(`https://transfer.sh/${fileName}`, fileData)
  if (res.data) {
    const parseUrl = new URL(res.data)
    return  parseUrl.origin + '/get' + parseUrl.pathname
  }
  return ''
}

/**
 * 获取带后缀的文件名
 * @param path
 */

export function getFileName (path:string): string {
  const pos1 = path.lastIndexOf('/')
  const pos2 = path.lastIndexOf('\\')
  const pos  = Math.max(pos1, pos2)
  if (pos < 0) { return path } else { return path.substring(pos + 1) }
}
