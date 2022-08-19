"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRunners = void 0;
async function executeRunners(runners) {
    for (const runner of runners) {
        const ret = await runner();
        if (ret) {
            return ret;
        }
    }
    return null;
}
exports.executeRunners = executeRunners;
//# sourceMappingURL=runner.js.map