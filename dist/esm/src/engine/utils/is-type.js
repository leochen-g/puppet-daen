export function isRoomId(id) {
    if (!id) {
        return false;
    }
    return /@chatroom$/.test(id);
}
export function isIMRoomId(id) {
    if (!id) {
        return false;
    }
    return /@im.chatroom$/.test(id);
}
export function isContactId(id) {
    if (!id) {
        return false;
    }
    return !isRoomId(id) && !isIMRoomId(id) && !isIMContactId(id);
}
export function isIMContactId(id) {
    if (!id) {
        return false;
    }
    return /@openim$/.test(id);
}
export function isContactOfficialId(id) {
    if (!id) {
        return false;
        // throw new Error('no id')
    }
    return /^gh_/i.test(id);
}
export function isStrangerV1(strangerId) {
    if (!strangerId) {
        return false;
        // throw new Error('no id')
    }
    return /^v1_/i.test(strangerId);
}
export function isStrangerV2(strangerId) {
    if (!strangerId) {
        return false;
        // throw new Error('no id')
    }
    return /^v2_/i.test(strangerId);
}
export function isPayload(payload) {
    if (payload && Object.keys(payload).length > 0) {
        return true;
    }
    return false;
}
//# sourceMappingURL=is-type.js.map