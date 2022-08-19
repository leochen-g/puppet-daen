"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMiniProgramMessagePayload = void 0;
const xml_to_json_js_1 = require("../utils/xml-to-json.js");
async function parseMiniProgramMessagePayload(rawPayload) {
    const miniProgramXml = await (0, xml_to_json_js_1.xmlToJson)(rawPayload.msg);
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
exports.parseMiniProgramMessagePayload = parseMiniProgramMessagePayload;
//# sourceMappingURL=message-miniprogram.js.map