"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSysmsgRevokeMsgMessagePayload = exports.parseSysmsgTodoMessagePayload = exports.parseSysmsgSysmsgTemplateMessagePayload = exports.parseSysmsgPatMessagePayload = exports.parseSysmsgMessagePayload = void 0;
const types_js_1 = require("../types.js");
const xml_to_json_js_1 = require("../utils/xml-to-json.js");
const message_pat_js_1 = require("./sysmsg/message-pat.js");
const message_sysmsgtemplate_js_1 = require("./sysmsg/message-sysmsgtemplate.js");
const message_todo_js_1 = require("./sysmsg/message-todo.js");
const message_revokemsg_js_1 = require("./sysmsg/message-revokemsg.js");
async function parseSysmsgMessagePayload(message) {
    if (message.msgType !== types_js_1.WechatMessageType.Sys) {
        return null;
    }
    const content = message.msg.trim();
    const sysmsgIndex = content.indexOf('<sysmsg');
    if (sysmsgIndex === -1) {
        return null;
    }
    const sysmsgXml = await (0, xml_to_json_js_1.xmlToJson)(content.substring(sysmsgIndex));
    let payload;
    switch (sysmsgXml.sysmsg.$.type) {
        case 'pat':
            payload = await (0, message_pat_js_1.parsePatMessagePayload)(sysmsgXml.sysmsg.pat);
            break;
        case 'sysmsgtemplate':
            payload = await (0, message_sysmsgtemplate_js_1.parseSysmsgTemplateMessagePayload)(sysmsgXml.sysmsg.sysmsgtemplate);
            break;
        case 'roomtoolstips':
            payload = await (0, message_todo_js_1.parseTodoMessagePayload)(sysmsgXml.sysmsg.todo);
            break;
        case 'revokemsg':
            payload = await (0, message_revokemsg_js_1.parseRevokeMsgMessagePayload)(sysmsgXml.sysmsg.revokemsg);
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
exports.parseSysmsgMessagePayload = parseSysmsgMessagePayload;
async function parseSysmsgPatMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'pat') {
        return null;
    }
    return sysmsgPayload.payload;
}
exports.parseSysmsgPatMessagePayload = parseSysmsgPatMessagePayload;
async function parseSysmsgSysmsgTemplateMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'sysmsgtemplate') {
        return null;
    }
    return sysmsgPayload.payload;
}
exports.parseSysmsgSysmsgTemplateMessagePayload = parseSysmsgSysmsgTemplateMessagePayload;
async function parseSysmsgTodoMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'roomtoolstips') {
        return null;
    }
    return sysmsgPayload.payload;
}
exports.parseSysmsgTodoMessagePayload = parseSysmsgTodoMessagePayload;
async function parseSysmsgRevokeMsgMessagePayload(message) {
    const sysmsgPayload = await parseSysmsgMessagePayload(message);
    if (!sysmsgPayload || sysmsgPayload.type !== 'revokemsg') {
        return null;
    }
    return sysmsgPayload.payload;
}
exports.parseSysmsgRevokeMsgMessagePayload = parseSysmsgRevokeMsgMessagePayload;
//# sourceMappingURL=message-sysmsg.js.map