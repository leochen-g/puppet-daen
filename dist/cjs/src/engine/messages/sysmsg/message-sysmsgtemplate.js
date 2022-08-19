"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSysmsgTemplateRunner = exports.parseSysmsgTemplate = exports.parseSysmsgTemplateMessagePayload = void 0;
/* eslint-disable camelcase */
const regex_js_1 = require("../../utils/regex.js");
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
async function parseSysmsgTemplateMessagePayload(sysmsgTemplateXml) {
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
exports.parseSysmsgTemplateMessagePayload = parseSysmsgTemplateMessagePayload;
async function parseSysmsgTemplate(sysmsgTemplatePayload, regexList, handler) {
    return (0, regex_js_1.parseTextWithRegexList)(sysmsgTemplatePayload.template, regexList, async (matchedRegexIndex) => {
        return handler(sysmsgTemplatePayload.templateLinkList, matchedRegexIndex);
    });
}
exports.parseSysmsgTemplate = parseSysmsgTemplate;
function createSysmsgTemplateRunner(sysmsgTemplatePayload, regexList, handler) {
    return async () => parseSysmsgTemplate(sysmsgTemplatePayload, regexList, handler);
}
exports.createSysmsgTemplateRunner = createSysmsgTemplateRunner;
//# sourceMappingURL=message-sysmsgtemplate.js.map