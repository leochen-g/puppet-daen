import type * as PUPPET from 'wechaty-puppet';
import type { MessagePayload, ContactPayload, MessageRevokeInfo, Label } from '../engine-schema.js';
export declare type RoomMemberMap = {
    [contactId: string]: ContactPayload;
};
export declare class CacheManager {
    private readonly _userName;
    private _messageCache?;
    private _messageRevokeCache?;
    private _contactCache?;
    private _contactSearchCache?;
    private _contactStrangerAliasCache?;
    private _roomCache?;
    private _roomMemberCache?;
    private _roomInvitationCache?;
    private _friendshipCache?;
    private _labelList?;
    constructor(userName: string);
    init(): Promise<void>;
    close(): Promise<void>;
    /**
     * -------------------------------
     * Message Section
     * --------------------------------
     */
    getMessage(messageId: string): Promise<MessagePayload | undefined>;
    setMessage(messageId: string, payload: MessagePayload): Promise<void>;
    hasMessage(messageId: string): Promise<boolean>;
    getMessageRevokeInfo(messageId: string): Promise<MessageRevokeInfo | undefined>;
    setMessageRevokeInfo(messageId: string, messageSendResult: MessageRevokeInfo): Promise<void>;
    /**
     * -------------------------------
     * Contact Section
     * --------------------------------
     */
    getContact(contactId: string): Promise<ContactPayload | undefined>;
    setContact(contactId: string, payload: ContactPayload): Promise<void>;
    deleteContact(contactId: string): Promise<void>;
    getContactIds(): Promise<string[]>;
    getAllContacts(): Promise<ContactPayload[]>;
    hasContact(contactId: string): Promise<boolean>;
    getContactCount(): Promise<number>;
    /**
     * contact search
     */
    getContactSearch(id: string): Promise<ContactPayload | undefined>;
    setContactSearch(id: string, payload: ContactPayload): Promise<void>;
    hasContactSearch(id: string): Promise<boolean>;
    getContactStrangerAlias(encryptedUserName: string): Promise<string | undefined>;
    setContactStrangerAlias(encryptedUserName: string, alias: string): Promise<void>;
    deleteContactStrangerAlias(encryptedUserName: string): Promise<void>;
    /**
     * -------------------------------
     * Room Section
     * --------------------------------
     */
    getRoom(roomId: string): Promise<ContactPayload | undefined>;
    setRoom(roomId: string, payload: ContactPayload): Promise<void>;
    deleteRoom(roomId: string): Promise<void>;
    getRoomIds(): Promise<string[]>;
    getRoomCount(): Promise<number>;
    hasRoom(roomId: string): Promise<boolean>;
    /**
     * -------------------------------
     * Room Member Section
     * --------------------------------
     */
    getRoomMember(roomId: string): Promise<RoomMemberMap | undefined>;
    setRoomMember(roomId: string, payload: RoomMemberMap): Promise<void>;
    deleteRoomMember(roomId: string): Promise<void>;
    /**
     * -------------------------------
     * Room Invitation Section
     * -------------------------------
     */
    getRoomInvitation(messageId: string): Promise<PUPPET.payloads.RoomInvitation | undefined>;
    setRoomInvitation(messageId: string, payload: PUPPET.payloads.RoomInvitation): Promise<void>;
    deleteRoomInvitation(messageId: string): Promise<void>;
    /**
     * -------------------------------
     * Friendship Cache Section
     * --------------------------------
     */
    getFriendshipRawPayload(id: string): Promise<PUPPET.payloads.FriendshipReceive | undefined>;
    setFriendshipRawPayload(id: string, payload: PUPPET.payloads.FriendshipReceive): Promise<void>;
    getLabelList(): Label[] | undefined;
    setLabelList(labelList: Label[]): void;
}
//# sourceMappingURL=cache-manager.d.ts.map