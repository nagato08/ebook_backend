import { JwtService } from '@nestjs/jwt';

/**
 * Vrai si l'email fait partie des admins (ADMIN_EMAIL = liste séparée par des
 * virgules, ex: "a@x.com,b@y.com"). Comparaison insensible à la casse.
 * Pas de rôle en DB: les admins sont définis par la variable d'env ADMIN_EMAIL.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/**
 * Détermine si la requête porte un JWT dont l'email est admin.
 * Utilisé par le guard maintenance (bypass) et /status (flag admin côté front).
 */
export function isAdminRequest(
  req: { headers: Record<string, unknown> },
  jwt: JwtService,
): boolean {
  const auth = req.headers['authorization'];
  if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) return false;

  try {
    const payload = jwt.verify<{ email?: string }>(auth.slice(7));
    return isAdminEmail(payload.email);
  } catch {
    return false;
  }
}
