import * as PUPPET from 'wechaty-puppet';
import { AppMessageType, parseAppmsgMessagePayload } from '../../messages/message-appmsg.js';
import { WechatMessageType } from '../../types.js';
export const referMsgParser = async (_padLocalMessage, ret, context) => {
    if (!context.appMessagePayload || context.appMessagePayload.type !== AppMessageType.ReferMsg) {
        return ret;
    }
    const appPayload = context.appMessagePayload;
    let referMessageContent;
    const referMessagePayload = appPayload.refermsg;
    const referMessageType = parseInt(referMessagePayload.type);
    switch (referMessageType) {
        case WechatMessageType.Text:
            referMessageContent = referMessagePayload.content;
            break;
        case WechatMessageType.Image:
            referMessageContent = '图片';
            break;
        case WechatMessageType.Video:
            referMessageContent = '视频';
            break;
        case WechatMessageType.Emoticon:
            referMessageContent = '动画表情';
            break;
        case WechatMessageType.Location:
            referMessageContent = '位置';
            break;
        case WechatMessageType.App: {
            const referMessageAppPayload = await parseAppmsgMessagePayload(referMessagePayload.content);
            referMessageContent = referMessageAppPayload.title;
            break;
        }
        default:
            referMessageContent = '未知消息';
            break;
    }
    ret.type = PUPPET.types.Message.Text;
    ret.text = `「${referMessagePayload.displayname}：${referMessageContent}」\n- - - - - - - - - - - - - - -\n${appPayload.title}`;
    return ret;
};
//# sourceMappingURL=message-parser-refermsg.js.map