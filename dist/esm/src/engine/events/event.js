import { log } from 'wechaty-puppet';
export var EventType;
(function (EventType) {
    EventType[EventType["Message"] = 0] = "Message";
    EventType[EventType["Friendship"] = 1] = "Friendship";
    EventType[EventType["RoomInvite"] = 2] = "RoomInvite";
    EventType[EventType["RoomJoin"] = 3] = "RoomJoin";
    EventType[EventType["RoomLeave"] = 4] = "RoomLeave";
    EventType[EventType["RoomTopic"] = 5] = "RoomTopic";
})(EventType || (EventType = {}));
const EventParserList = [];
export function addEventParser(eventType, parser) {
    EventParserList.push({
        handler: parser,
        type: eventType,
    });
}
export async function parseEvent(puppet, message) {
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
            log.error('[Event]', `parse message error: ${e.stack}`);
        }
    }
    // return normal as message bvy default
    return {
        payload: message,
        type: EventType.Message,
    };
}
//# sourceMappingURL=event.js.map