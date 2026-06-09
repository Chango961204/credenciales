const SENSITIVE_KEY_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /authorization/i,
    /cookie/i,
    /^qrUrl$/i,
];

const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function sanitize(value, depth = 0) {
    if (value == null) return value;
    if (depth > 8) return "[MaxDepth]";

    if (typeof value === "string") {
        return JWT_PATTERN.test(value) ? "***" : value;
    }

    if (value instanceof Date) return value;
    if (Buffer.isBuffer(value)) return "[Buffer]";

    if (Array.isArray(value)) {
        return value.map((item) => sanitize(item, depth + 1));
    }

    if (typeof value === "object") {
        const plain = typeof value.get === "function" ? value.get({ plain: true }) : value;
        const result = {};

        for (const [key, entryValue] of Object.entries(plain)) {
            if (SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
                result[key] = "***";
            } else {
                result[key] = sanitize(entryValue, depth + 1);
            }
        }

        return result;
    }

    return value;
}

export function auditSafe(obj) {
    return sanitize(obj);
}
