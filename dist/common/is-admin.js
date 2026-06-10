"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminRequest = isAdminRequest;
function isAdminRequest(req, jwt) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail)
        return false;
    const auth = req.headers['authorization'];
    if (typeof auth !== 'string' || !auth.startsWith('Bearer '))
        return false;
    try {
        const payload = jwt.verify(auth.slice(7));
        return payload.email === adminEmail;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=is-admin.js.map