"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_type_js_1 = require("../utils/is-type.js");
const regex_js_1 = require("../utils/regex.js");
const types_js_1 = require("../types.js");
const runner_js_1 = require("../utils/runner.js");
const OTHER_CHANGE_TOPIC_REGEX_LIST = [
    /^"(.+)"修改群名为“(.+)”$/,
    /^"(.+)" changed the group name to "(.+)"$/,
];
const YOU_CHANGE_TOPIC_REGEX_LIST = [
    /^(你)修改群名为“(.+)”$/,
    /^(You) changed the group name to "(.+)"$/,
];
exports.default = async (puppet, message) => {
    const roomId = message.fromWxid;
    if (!(0, is_type_js_1.isRoomId)(roomId) || message.msgType !== types_js_1.WechatMessageType.Sys) {
        return null;
    }
    /**
     * 1. Message payload "you change the room topic" is plain text with type 10000 : https://gist.github.com/padlocal/0c7bb4f5d51e7e94a0efa108bebb4645
     * 你修改群名
     */
    const youChangeTopic = async () => {
        return (0, regex_js_1.parseTextWithRegexList)(message.msg, YOU_CHANGE_TOPIC_REGEX_LIST, async (_, match) => {
            const newTopic = match[2];
            return {
                changerId: puppet.currentUserId,
                newTopic,
            };
        });
    };
    /**
     * 2. Message payload "others change room topic" is xml text with type 10002: https://gist.github.com/padlocal/3480ada677839c8c11578d47e820e893
     * 别人修改群名
     */
    const otherChangeTopic = async () => {
        return (0, regex_js_1.parseTextWithRegexList)(message.msg, OTHER_CHANGE_TOPIC_REGEX_LIST, async (_, match) => {
            const newTopic = match[2];
            const changeName = match[1];
            let changeId = '';
            if (changeName) {
                changeId = (await puppet.roomMemberSearch(roomId, changeName))[0];
            }
            return {
                changerId: changeId,
                newTopic,
            };
        });
    };
    const topicChange = await (0, runner_js_1.executeRunners)([youChangeTopic, otherChangeTopic]);
    if (topicChange) {
        const room = await puppet.roomPayload(roomId);
        const oldTopic = room.topic;
        return {
            changerId: topicChange.changerId,
            newTopic: topicChange.newTopic,
            oldTopic,
            roomId,
            timestamp: message.timeStamp,
        };
    }
    return null;
};
//# sourceMappingURL=event-room-topic.js.map