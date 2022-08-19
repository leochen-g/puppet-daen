/* eslint-disable camelcase */
import { parseTextWithRegexList } from '../../utils/regex.js';
/**
 * xmlToJson will return element instead of array if xml node only contains one child.
 * @param list
 */
function toList(list) {
    if (!Array.isArray(list)) {
        return [list];
    }
    else {
        return list;
    }
}
export async function parseSysmsgTemplateMessagePayload(sysmsgTemplateXml) {
    const linkList = toList(sysmsgTemplateXml.content_template.link_list.link);
    const allLinkList = linkList.map((link) => {
        const type = link.$.type;
        let payload;
        if (type === 'link_profile') {
            const memberList = toList(link.memberlist.member);
            payload = memberList.map((member) => {
                return {
                    nickName: member.nickname,
                    userName: member.username,
                };
            });
        }
        else if (link.$.type === 'link_revoke') {
            payload = {
                title: link.title,
                userNameList: toList(link.usernamelist.username),
            };
        }
        else {
            // handle more link type here
        }
        return {
            name: link.$.name,
            payload: payload,
            type,
        };
    });
    const template = sysmsgTemplateXml.content_template.template;
    const matches = [...template.matchAll(/\$(.+?)\$/g)];
    const templateLinkList = matches.map(match => {
        const linkName = match[1];
        return allLinkList.filter((link) => link.name === linkName)[0];
    });
    return {
        template,
        templateLinkList,
    };
}
export async function parseSysmsgTemplate(sysmsgTemplatePayload, regexList, handler) {
    return parseTextWithRegexList(sysmsgTemplatePayload.template, regexList, async (matchedRegexIndex) => {
        return handler(sysmsgTemplatePayload.templateLinkList, matchedRegexIndex);
    });
}
export function createSysmsgTemplateRunner(sysmsgTemplatePayload, regexList, handler) {
    return async () => parseSysmsgTemplate(sysmsgTemplatePayload, regexList, handler);
}
//# sourceMappingURL=message-sysmsgtemplate.js.map