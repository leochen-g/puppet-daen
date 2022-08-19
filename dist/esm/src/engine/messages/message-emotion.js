import { xmlToJson } from '../utils/xml-to-json.js';
export async function parseEmotionMessagePayload(message) {
    const jsonPayload = await xmlToJson(message.msg);
    const len = parseInt(jsonPayload.msg.emoji.$.len, 10) || 0;
    const width = parseInt(jsonPayload.msg.emoji.$.width, 10) || 0;
    const height = parseInt(jsonPayload.msg.emoji.$.height, 10) || 0;
    const cdnurl = jsonPayload.msg.emoji.$.cdnurl;
    const type = parseInt(jsonPayload.msg.emoji.$.type, 10) || 0;
    const md5 = jsonPayload.msg.emoji.$.md5;
    let gameext;
    if (jsonPayload.msg.gameext) {
        const gameextType = parseInt(jsonPayload.msg.gameext.$.type, 10) || 0;
        const gameextContent = parseInt(jsonPayload.msg.gameext.$.content, 10) || 0;
        gameext = `<gameext type="${gameextType}" content="${gameextContent}" ></gameext>`;
    }
    return {
        cdnurl,
        gameext,
        height,
        len,
        md5,
        type,
        width,
    };
}
export function generateEmotionPayload(emojiMessagePayload) {
    return `<msg><emoji cdnurl="${emojiMessagePayload.cdnurl}" len="${emojiMessagePayload.len}" md5="${emojiMessagePayload.md5}" type="${emojiMessagePayload.type}"/>${emojiMessagePayload.gameext || ''}</msg>`;
}
//# sourceMappingURL=message-emotion.js.map