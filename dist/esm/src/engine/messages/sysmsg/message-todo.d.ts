export interface TodoXmlSchema {
    op: string;
    todoid: string;
    username: string;
    path: string;
    time: number;
    custominfo: string;
    title: string;
    creator: string;
    related_msgid: string;
    manager: string;
    nreply: number;
    scene: string;
    oper: string;
    sharekey: string;
    sharename: string;
    template?: string;
}
export interface TodoMessagePayload {
    id: string;
    creatorUserName: string;
    operatorUserName: string;
    numberOfReply: number;
    appId: string;
    path: string;
    relatedMessageId: string;
    title: string;
    template?: string;
}
export declare function parseTodoMessagePayload(todoXml: TodoXmlSchema): Promise<TodoMessagePayload>;
//# sourceMappingURL=message-todo.d.ts.map