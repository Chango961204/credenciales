export function diffObjects(oldObj = {}, newObj = {}) {
    const changed = {};
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const k of keys) {
        const oldVal = oldObj[k];
        const newVal = newObj[k];

        if (["createdAt", "updatedAt"].includes(k)) continue;

        const isEqual =
            (oldVal === newVal) ||
            (oldVal == null && newVal == null) ||
            (JSON.stringify(oldVal) === JSON.stringify(newVal));

        if (!isEqual) {
            changed[k] = { old: oldVal, new: newVal };
        }
    }
    return changed;
}
