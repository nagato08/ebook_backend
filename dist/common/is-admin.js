"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminEmail = isAdminEmail;
exports.isAdminRequest = isAdminRequest;
function isAdminEmail(email) {
    if (!email)
        return false;
    const list = (process.env.ADMIN_EMAIL ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return list.includes(email.toLowerCase());
}
function isAdminRequest(req, jwt) {
    const auth = req.headers['authorization'];
    if (typeof auth !== 'string' || !auth.startsWith('Bearer '))
        return false;
    try {
        const payload = jwt.verify(auth.slice(7));
        return isAdminEmail(payload.email);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=is-admin.js.map