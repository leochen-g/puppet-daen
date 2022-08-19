import type { Runner } from '../../utils/runner.js';
export interface SysmsgTemplateXmlSchema {
    content_template: {
        $: {
            type: string;
        };
        plain: string;
        template: string;
        link_list: {
            link: [
                {
                    $: {
                        name: string;
                        type: string;
                        hidden?: string;
                    };
                    memberlist?: {
                        member: [
                            {
                                username?: string;
                                nickname: string;
                            }
                        ];
                    };
                    separator?: string;
                    title?: string;
                    usernamelist?: {
                        username: string[];
                    };
                }
            ];
        };
    };
}
export interface SysmsgTemplateLinkMember {
    userName?: string;
    nickName: string;
}
export declare type SysmsgTemplateLinkProfile = Array<SysmsgTemplateLinkMember>;
export interface SysmsgTemplateLinkRevoke {
    title: string;
    userNameList: string[];
}
export declare type SysmsgTemplateLinkType = 'link_profile' | 'link_revoke';
export declare type SysmsgTemplateLinkPayload = SysmsgTemplateLinkProfile | SysmsgTemplateLinkRevoke;
export interface SysmsgTemplateLink {
    name: string;
    payload: SysmsgTemplateLinkPayload;
    type: SysmsgTemplateLinkType;
}
export interface SysmsgTemplateMessagePayload {
    template: string;
    templateLinkList: Array<SysmsgTemplateLink>;
}
export declare function parseSysmsgTemplateMessagePayload(sysmsgTemplateXml: SysmsgTemplateXmlSchema): Promise<SysmsgTemplateMessagePayload>;
export declare type SysmsgTemplateHandler<T> = (templateLinkList: SysmsgTemplateLink[], matchedRegexIndex: number) => Promise<T>;
export declare function parseSysmsgTemplate<T>(sysmsgTemplatePayload: SysmsgTemplateMessagePayload, regexList: RegExp[], handler: SysmsgTemplateHandler<T>): Promise<T | null>;
export declare function createSysmsgTemplateRunner<T>(sysmsgTemplatePayload: SysmsgTemplateMessagePayload, regexList: RegExp[], handler: SysmsgTemplateHandler<T>): Runner<T>;
//# sourceMappingURL=message-sysmsgtemplate.d.ts.map