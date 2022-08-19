"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRunningPuppet = exports.addRunningPuppet = void 0;
const node_cleanup_1 = __importDefault(require("node-cleanup"));
const RunningPuppets = [];
(0, node_cleanup_1.default)((exitCode, signal) => {
    // can not take any async actions while process exiting
    if (exitCode !== null) {
        return true;
    }
    // make shallow copy
    const puppets = RunningPuppets.slice();
    Promise.all(puppets.map(async (puppet) => {
        await puppet.stop();
    })).finally(() => {
        node_cleanup_1.default.uninstall();
        process.kill(process.pid, signal);
    }).catch(console.error);
    return false;
});
function addRunningPuppet(puppet) {
    RunningPuppets.push(puppet);
}
exports.addRunningPuppet = addRunningPuppet;
function removeRunningPuppet(puppet) {
    const puppetIndex = RunningPuppets.indexOf(puppet);
    if (puppetIndex !== -1) {
        delete RunningPuppets[puppetIndex];
    }
}
exports.removeRunningPuppet = removeRunningPuppet;
//# sourceMappingURL=cleanup.js.map