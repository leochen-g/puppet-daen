"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPayload = exports.isStrangerV2 = exports.isStrangerV1 = exports.isContactOfficialId = exports.isIMContactId = exports.isContactId = exports.isIMRoomId = exports.isRoomId = void 0;
function isRoomId(id) {
    if (!id) {
        return false;
    }
    return /@chatroom$/.test(id);
}
exports.isRoomId = isRoomId;
function isIMRoomId(id) {
    if (!id) {
        return false;
    }
    return /@im.chatroom$/.test(id);
}
exports.isIMRoomId = isIMRoomId;
function isContactId(id) {
    if (!id) {
        return false;
    }
    return !isRoomId(id) && !isIMRoomId(id) && !isIMContactId(id);
}
exports.isContactId = isContactId;
function isIMContactId(id) {
    if (!id) {
        return false;
    }
    return /@openim$/.test(id);
}
exports.isIMContactId = isIMContactId;
function isContactOfficialId(id) {
    if (!id) {
        return false;
        // throw new Error('no id')
    }
    return /^gh_/i.test(id);
}
exports.isContactOfficialId = isContactOfficialId;
function isStrangerV1(strangerId) {
    if (!strangerId) {
        return false;
        // throw new Error('no id')
    }
    return /^v1_/i.test(strangerId);
}
exports.isStrangerV1 = isStrangerV1;
function isStrangerV2(strangerId) {
    if (!strangerId) {
        return false;
        // throw new Error('no id')
    }
    return /^v2_/i.test(strangerId);
}
exports.isStrangerV2 = isStrangerV2;
function isPayload(payload) {
    if (payload && Object.keys(payload).length > 0) {
        return true;
    }
    return false;
}
exports.isPayload = isPayload;
//# sourceMappingURL=is-type.js.map