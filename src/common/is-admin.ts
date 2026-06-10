import { JwtService } from '@nestjs/jwt';

/**
 * Détermine si la requête porte un JWT dont l'email == ADMIN_EMAIL.
 * Utilisé par le guard maintenance (bypass) et /status (flag admin côté front).
 * Pas de rôle en DB: l'admin est défini par la variable d'env ADMIN_EMAIL.
 */
export function isAdminRequest(
  req: { headers: Record<string, unknown> },
  jwt: JwtService,
): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const auth = req.headers['authorization'];
  if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) return false;

  try {
    const payload = jwt.verify<{ email?: string }>(auth.slice(7));
    return payload.email === adminEmail;
  } catch {
    return false;
  }
}
