"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEvent = exports.addEventParser = exports.EventType = void 0;
const wechaty_puppet_1 = require("wechaty-puppet");
var EventType;
(function (EventType) {
    EventType[EventType["Message"] = 0] = "Message";
    EventType[EventType["Friendship"] = 1] = "Friendship";
    EventType[EventType["RoomInvite"] = 2] = "RoomInvite";
    EventType[EventType["RoomJoin"] = 3] = "RoomJoin";
    EventType[EventType["RoomLeave"] = 4] = "RoomLeave";
    EventType[EventType["RoomTopic"] = 5] = "RoomTopic";
})(EventType = exports.EventType || (exports.EventType = {}));
const EventParserList = [];
function addEventParser(eventType, parser) {
    EventParserList.push({
        handler: parser,
        type: eventType,
    });
}
exports.addEventParser = addEventParser;
async function parseEvent(puppet, message) {
    for (const parser of EventParserList) {
        try {
            const parsedPayload = await parser.handler(puppet, message);
            if (parsedPayload) {
                return {
                    payload: parsedPayload,
                    type: parser.type,
                };
            }
        }
        catch (e) {
            wechaty_puppet_1.log.error('[Event]', `parse message error: ${e.stack}`);
        }
    }
    // return normal as message bvy default
    return {
        payload: message,
        type: EventType.Message,
    };
}
exports.parseEvent = parseEvent;
//# sourceMappingURL=event.js.map