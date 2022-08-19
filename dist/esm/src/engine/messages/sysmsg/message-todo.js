export async function parseTodoMessagePayload(todoXml) {
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
//# sourceMappingURL=message-todo.js.map