# Ebook Backend (NestJS)

Backend de génération d'ebooks par IA, avec crédits et paiement Mobile Money via **pawaPay**.
Inspiré du modèle Bookzy : bonus à l'inscription → génération à crédits → recharge par paiement.

## Stack

- **NestJS 11** + TypeScript
- **Prisma 6** (SQLite en dev ; passer en PostgreSQL pour la prod)
- **JWT** (auth bearer) + bcrypt
- **pawaPay Merchant API v2** (dépôts Mobile Money)
- **Génération** branchée sur un **webhook n8n** (avec fallback mock si non configuré)

## Démarrage

```bash
npm install
npx prisma migrate dev      # crée/maj la base SQLite (dev.db)
npm run start:dev           # http://localhost:3001
```

Variables d'environnement (`.env`) :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion DB (def: `file:./dev.db`) |
| `PORT` | Port HTTP (def: 3001) |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Signature JWT |
| `N8N_WEBHOOK_URL` | Workflow n8n de génération. Vide → mode mock |
| `N8N_WEBHOOK_TOKEN` | Bearer optionnel envoyé à n8n |
| `GENERATION_COST_CREDITS` | Coût d'une génération (def: 20) |
| `PAWAPAY_BASE_URL` | `https://api.sandbox.pawapay.io` (sandbox) ou `https://api.pawapay.io` (prod) |
| `PAWAPAY_API_TOKEN` | Token API pawaPay (Bearer) |
| `PAWAPAY_CALLBACK_URL` | URL publique appelée par pawaPay à la fin du paiement |

## API

### Auth
- `POST /auth/register` `{ email, password, name? }` → `{ token, user }` (bonus crédits offerts)
- `POST /auth/login` `{ email, password }` → `{ token, user }`
- `GET /users/me` *(JWT)* → profil + solde

### Livres
- `POST /books` *(JWT)* `{ title, topic, audience?, tone?, language?, style? }`
- `GET /books` *(JWT)* → liste
- `GET /books/:id` *(JWT)* → livre + chapitres
- `DELETE /books/:id` *(JWT)*
- `PATCH /books/:id/chapters/:chapterId` *(JWT)* `{ title?, content? }` → édition manuelle

### Génération
- `POST /books/:id/generate` *(JWT)* `{ chapters? }` → débite les crédits, passe en `GENERATING`, traite en arrière-plan
- `GET /books/:id/status` *(JWT)* → `{ status, progress, chapters, coverUrl }`

> En cas d'échec de génération, les crédits sont **remboursés** automatiquement.

### Crédits
- `GET /credits/balance` *(JWT)* → `{ credits }`
- `GET /credits/ledger` *(JWT)* → historique des mouvements

### Paiements (pawaPay)
- `GET /payments/packs` → packs de crédits disponibles
- `POST /payments/deposit` *(JWT)* `{ packId, phoneNumber, provider, currency? }` → initie un dépôt Mobile Money
- `POST /payments/callback` *(public)* → reçu de pawaPay ; crédite le compte si succès (idempotent)
- `GET /payments/deposit/:depositId/status` *(JWT)* → vérifie/synchronise le statut

## Flux paiement → crédits

1. Front appelle `POST /payments/deposit` avec le pack + numéro + opérateur (`provider`).
2. Backend génère un `depositId` (UUID v4), crée un `Payment` `PENDING`, appelle pawaPay `/v2/deposits`.
3. Le client valide sur son téléphone (code PIN).
4. pawaPay appelle `POST /payments/callback` avec le statut final.
5. Si `COMPLETED`/`SUCCESSFUL` → crédits ajoutés une seule fois (idempotent).
6. Secours : `GET /payments/deposit/:depositId/status` (polling).

> Codes `provider` et devises dépendent du pays (ex: `MTN_MOMO_ZMB`/`ZMW` en sandbox, `XOF` en zone UEMOA). Voir la doc pawaPay.

## Génération via n8n

Quand `N8N_WEBHOOK_URL` est défini, le backend POST le contexte du livre :

```json
{ "bookId", "title", "topic", "audience", "tone", "language", "style", "chapters" }
```

n8n (nœud *Respond to Webhook*) doit répondre :

```json
{ "coverUrl": "https://...", "chapters": [ { "order": 1, "title": "...", "content": "..." } ] }
```

Sans `N8N_WEBHOOK_URL`, un contenu mock est généré (utile en dev).

## Passage en production

- Prisma : `provider = "postgresql"` + `DATABASE_URL` Postgres, puis `prisma migrate deploy`.
- Renseigner `PAWAPAY_API_TOKEN` + `PAWAPAY_BASE_URL` prod + `PAWAPAY_CALLBACK_URL` publique (HTTPS).
- Changer `JWT_SECRET`.
- Brancher `N8N_WEBHOOK_URL` sur le workflow réel.
