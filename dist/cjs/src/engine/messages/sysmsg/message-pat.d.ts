export interface PatXmlSchema {
    fromusername: string;
    chatusername: string;
    pattedusername: string;
    template: string;
}
export interface PatMessagePayload {
    fromUserName: string;
    chatUserName: string;
    pattedUserName: string;
    template: string;
}
export declare function parsePatMessagePayload(patXml: PatXmlSchema): Promise<PatMessagePayload>;
//# sourceMappingURL=message-pat.d.ts.map