export async function executeRunners(runners) {
    for (const runner of runners) {
        const ret = await runner();
        if (ret) {
            return ret;
        }
    }
    return null;
}
//# sourceMappingURL=runner.js.map