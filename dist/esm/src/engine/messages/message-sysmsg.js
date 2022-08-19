import { WechatMessageType } from '../types.js';
import { xmlToJson } from '../utils/xml-to-json.js';
import { parsePatMessagePayload } from './sysmsg/message-pat.js';
import { parseSysmsgTemplateMessagePayload } from './sysmsg/message-sysmsgtemplate.js';
import { parseTodoMessagePayload } from './sysmsg/message-todo.js';
import { parseRevokeMsgMessagePayload } from './sysmsg/message-revokemsg.js';
export async function parseSysmsgMessagePayload(message) {
    if (message.msgType !== WechatMessageType.Sys) {
        return null;
    }
    const content = message.msg.trim();
    const sysmsgIndex = content.indexOf('<sysmsg');
    if (sysmsgIndex === -1) {
        return null;
    }
    const sysmsgXml = await xmlToJson(content.substring(sysmsgIndex));
    let payload;
    switch (sysmsgXml.sysmsg.$.type) {
        case 'pat':
            payload = await parsePatMessagePayload(sysmsgXml.sysmsg.pat);
            break;
        case 'sysmsgtemplate':
            payload = await parseSysmsgTemplateMessagePayload(sysmsgXml.sysmsg.sysmsgtemplate);
            break;
        case 'roomtoolstips':
            payload = await parseTodoMessagePayload(sysmsgXml.sysmsg.todo);
            break;
        case 'revokemsg':
            payload = await parseRevokeMsgMessagePayload(sysmsgXml.sysmsg.revokemsg);
            break;
    }
    if (payload) {
        return {
            payload,
            type: sysmsgXml.sysmsg.$.type,
        };
    }
    else {
        return null;
    }
}
export async function parseSysmsgPatMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'pat') {
        return null;
    }
    return sysmsgPayload.payload;
}
export async function parseSysmsgSysmsgTemplateMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'sysmsgtemplate') {
        return null;
    }
    return sysmsgPayload.payload;
}
export async function parseSysmsgTodoMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'roomtoolstips') {
        return null;
    }
    return sysmsgPayload.payload;
}
export async function parseSysmsgRevokeMsgMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'revokemsg') {
        return null;
    }
    return sysmsgPayload.payload;
}
//# sourceMappingURL=message-sysmsg.js.map