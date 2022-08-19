"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeMessageParsers = void 0;
const message_parser_js_1 = require("./message-parser.js");
Object.defineProperty(exports, "executeMessageParsers", { enumerable: true, get: function () { return message_parser_js_1.executeMessageParsers; } });
const message_parser_type_js_1 = require("./message-parser-type.js");
const message_parser_room_js_1 = require("./message-parser-room.js");
const message_parser_single_chat_js_1 = require("./message-parser-single-chat.js");
const message_parser_appmsg_js_1 = require("./message-parser-appmsg.js");
const message_parser_refermsg_js_1 = require("./message-parser-refermsg.js");
const message_parser_sysmsg_js_1 = require("./message-parser-sysmsg.js");
// The order of message parser is important
(0, message_parser_js_1.addMessageParser)(message_parser_type_js_1.typeParser);
(0, message_parser_js_1.addMessageParser)(message_parser_room_js_1.roomParser);
(0, message_parser_js_1.addMessageParser)(message_parser_single_chat_js_1.singleChatParser);
(0, message_parser_js_1.addMessageParser)(message_parser_appmsg_js_1.appMsgParser);
(0, message_parser_js_1.addMessageParser)(message_parser_refermsg_js_1.referMsgParser);
(0, message_parser_js_1.addMessageParser)(message_parser_sysmsg_js_1.sysmsgParser);
//# sourceMappingURL=mod.js.map