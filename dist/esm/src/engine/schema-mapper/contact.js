import * as PUPPET from 'wechaty-puppet';
import { isContactOfficialId } from '../utils/is-type.js';
export function engineContactToWechaty(contact) {
    return {
        alias: contact.remark,
        avatar: contact.avatar,
        city: contact.city,
        gender: contact.sex,
        id: contact.wxid,
        name: contact.name,
        phone: [],
        province: contact.province,
        signature: contact.sign,
        type: isContactOfficialId(contact.wxid) ? PUPPET.types.Contact.Official : PUPPET.types.Contact.Individual,
        weixin: contact.wxNum,
    };
}
//# sourceMappingURL=contact.js.map