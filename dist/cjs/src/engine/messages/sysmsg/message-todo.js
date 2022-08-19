"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTodoMessagePayload = void 0;
async function parseTodoMessagePayload(todoXml) {
    return {
        appId: todoXml.username,
        creatorUserName: todoXml.creator,
        id: todoXml.todoid,
        numberOfReply: todoXml.nreply,
        operatorUserName: todoXml.oper,
        path: todoXml.path,
        relatedMessageId: todoXml.related_msgid,
        template: todoXml.template,
        title: todoXml.title,
    };
}
exports.parseTodoMessagePayload = parseTodoMessagePayload;
//# sourceMappingURL=message-todo.js.map