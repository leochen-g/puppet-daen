import { xmlToJson } from '../utils/xml-to-json.js';
export async function parseMiniProgramMessagePayload(rawPayload) {
    const miniProgramXml = await xmlToJson(rawPayload.msg);
    const appmsg = miniProgramXml.msg.appmsg;
    const weappinfo = appmsg.weappinfo;
    const appattach = appmsg.appattach;
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
    };
}
//# sourceMappingURL=message-miniprogram.js.map