"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppetEngine = exports.log = exports.VERSION = void 0;
const puppet_engine_js_1 = require("./puppet-engine.js");
Object.defineProperty(exports, "PuppetEngine", { enumerable: true, get: function () { return puppet_engine_js_1.PuppetEngine; } });
var config_js_1 = require("./config.js");
Object.defineProperty(exports, "VERSION", { enumerable: true, get: function () { return config_js_1.VERSION; } });
Object.defineProperty(exports, "log", { enumerable: true, get: function () { return config_js_1.log; } });
exports.default = puppet_engine_js_1.PuppetEngine;
//# sourceMappingURL=mod.js.map