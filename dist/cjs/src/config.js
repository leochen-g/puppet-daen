"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMORY_SLOT = exports.log = exports.VERSION = void 0;
const wechaty_puppet_1 = require("wechaty-puppet");
Object.defineProperty(exports, "log", { enumerable: true, get: function () { return wechaty_puppet_1.log; } });
const package_json_js_1 = require("./package-json.js");
const VERSION = package_json_js_1.packageJson.version || '0.0.0';
exports.VERSION = VERSION;
const MEMORY_SLOT = 'PUPPET_ENGINE';
exports.MEMORY_SLOT = MEMORY_SLOT;
//# sourceMappingURL=config.js.map