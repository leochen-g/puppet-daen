import type * as PUPPET from 'wechaty-puppet'
import type { MessagePayload } from '../../engine-schema.js'
import { xmlToJson } from '../utils/xml-to-json.js'

interface MiniProgramXmlSchema {
  msg: {
    appmsg: {
      title: string;
      sourcedisplayname: string;
      appattach: {
        cdnthumbaeskey: string;
        cdnthumburl: string;
      };
      weappinfo: {
        username: string;
        appid: string;
        pagepath: string;
        weappiconurl: string;
        shareId: string;
      };
      thumburl: string;
      md5: any;
    };
    fromusername: string;
  };
}

export async function parseMiniProgramMessagePayload (rawPayload: MessagePayload): Promise<PUPPET.payloads.MiniProgram> {
  const miniProgramXml: MiniProgramXmlSchema = await xmlToJson(rawPayload.msg)
  const appmsg = miniProgramXml.msg.appmsg
  const weappinfo = appmsg.weappinfo
  const appattach = appmsg.appattach

  return {
    appid: weappinfo.appid,
    description: appmsg.sourcedisplayname,
    iconUrl: weappinfo.weappiconurl,
    pagePath: weappinfo.pagepath,
    shareId: weappinfo.shareId,
    thumbKey: appattach.cdnthumbaeskey,
    thumbUrl: appattach.cdnthumburl,
    title: appmsg.title,
    username: weappinfo.username,
  }
}
