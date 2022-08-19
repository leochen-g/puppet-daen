import { isRoomId } from '../utils/is-type.js';
import { parseTextWithRegexList } from '../utils/regex.js';
import { WechatMessageType } from '../types.js';
import { executeRunners } from '../utils/runner.js';
const OTHER_CHANGE_TOPIC_REGEX_LIST = [
    /^"(.+)"修改群名为“(.+)”$/,
    /^"(.+)" changed the group name to "(.+)"$/,
];
const YOU_CHANGE_TOPIC_REGEX_LIST = [
    /^(你)修改群名为“(.+)”$/,
    /^(You) changed the group name to "(.+)"$/,
];
export default async (puppet, message) => {
    const roomId = message.fromWxid;
    if (!isRoomId(roomId) || message.msgType !== WechatMessageType.Sys) {
        return null;
    }
    /**
     * 1. Message payload "you change the room topic" is plain text with type 10000 : https://gist.github.com/padlocal/0c7bb4f5d51e7e94a0efa108bebb4645
     * 你修改群名
     */
    const youChangeTopic = async () => {
        return parseTextWithRegexList(message.msg, YOU_CHANGE_TOPIC_REGEX_LIST, async (_, match) => {
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
        return parseTextWithRegexList(message.msg, OTHER_CHANGE_TOPIC_REGEX_LIST, async (_, match) => {
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
    const topicChange = await executeRunners([youChangeTopic, otherChangeTopic]);
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