import nodeCleanup from 'node-cleanup';
const RunningPuppets = [];
nodeCleanup((exitCode, signal) => {
    // can not take any async actions while process exiting
    if (exitCode !== null) {
        return true;
    }
    // make shallow copy
    const puppets = RunningPuppets.slice();
    Promise.all(puppets.map(async (puppet) => {
        await puppet.stop();
    })).finally(() => {
        nodeCleanup.uninstall();
        process.kill(process.pid, signal);
    }).catch(console.error);
    return false;
});
export function addRunningPuppet(puppet) {
    RunningPuppets.push(puppet);
}
export function removeRunningPuppet(puppet) {
    const puppetIndex = RunningPuppets.indexOf(puppet);
    if (puppetIndex !== -1) {
        delete RunningPuppets[puppetIndex];
    }
}
//# sourceMappingURL=cleanup.js.map