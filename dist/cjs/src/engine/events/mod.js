"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.parseEvent = void 0;
const event_friendship_js_1 = __importDefault(require("./event-friendship.js"));
const event_room_invite_js_1 = __importDefault(require("./event-room-invite.js"));
const event_room_join_js_1 = __importDefault(require("./event-room-join.js"));
const event_room_leave_js_1 = __importDefault(require("./event-room-leave.js"));
const event_room_topic_js_1 = __importDefault(require("./event-room-topic.js"));
const event_message_js_1 = __importDefault(require("./event-message.js"));
const event_js_1 = require("./event.js");
Object.defineProperty(exports, "EventType", { enumerable: true, get: function () { return event_js_1.EventType; } });
Object.defineProperty(exports, "parseEvent", { enumerable: true, get: function () { return event_js_1.parseEvent; } });
(0, event_js_1.addEventParser)(event_js_1.EventType.Friendship, event_friendship_js_1.default);
(0, event_js_1.addEventParser)(event_js_1.EventType.RoomInvite, event_room_invite_js_1.default);
(0, event_js_1.addEventParser)(event_js_1.EventType.RoomJoin, event_room_join_js_1.default);
(0, event_js_1.addEventParser)(event_js_1.EventType.RoomLeave, event_room_leave_js_1.default);
(0, event_js_1.addEventParser)(event_js_1.EventType.RoomTopic, event_room_topic_js_1.default);
(0, event_js_1.addEventParser)(event_js_1.EventType.Message, event_message_js_1.default);
//# sourceMappingURL=mod.js.map