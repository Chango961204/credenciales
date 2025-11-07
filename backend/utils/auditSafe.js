const SENSITIVE = new Set([
    "password", "token", "accessToken", "refreshToken",
    "resetToken", "twoFactorSecret"
]);

export function auditSafe(obj) {
    if (!obj) return obj;
    const plain = typeof obj.get === "function" ? obj.get({ plain: true }) : { ...obj };
    for (const key of Object.keys(plain)) {
        if (SENSITIVE.has(key)) {
            plain[key] = "***";
        }
    }
    return plain;
}
