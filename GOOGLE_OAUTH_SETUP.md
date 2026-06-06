# Google OAuth Setup

## 1. Google Cloud Console Configuration

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet ou sélectionner un existant
3. Activer **Google+ API**:
   - Menu > APIs & Services > Library
   - Chercher "Google+ API"
   - Click "Enable"
4. Créer des credentials OAuth 2.0:
   - Menu > APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3001`
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
   - Click "Create"
5. Copier **Client ID** et **Client Secret**

## 2. Backend Configuration

Remplir `.env`:
```bash
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
```

Redémarrer le serveur:
```bash
npm run start:dev
```

## 3. Frontend Integration

### Option A: Direct Link (Simple)
```html
<a href="http://localhost:3001/auth/google">
  Login with Google
</a>
```

### Option B: Google Sign-In Button + Backend Flow
```typescript
// 1. Install Google Identity
<script src="https://accounts.google.com/gsi/client" async defer></script>

// 2. Initialize Google Sign-In
window.google.accounts.id.initialize({
  client_id: "YOUR_CLIENT_ID.apps.googleusercontent.com",
  callback: handleCredentialResponse,
});

// 3. Render button
window.google.accounts.id.renderButton(
  document.getElementById("buttonDiv"),
  { theme: "outline", size: "large" }
);

// 4. Handle response
function handleCredentialResponse(response) {
  // response.credential est le JWT Google
  // Envoyer à backend pour échanger contre un JWT custom
  fetch("http://localhost:3001/auth/google/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: response.credential }),
  })
  .then(res => res.json())
  .then(data => {
    // data.token = JWT custom
    localStorage.setItem("token", data.token);
  });
}
```

## 4. Test Local

```bash
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Test l'endpoint
curl "http://localhost:3001/auth/google"
# → Redirection vers Google OAuth consent screen

# Via navigateur:
# 1. Ouvrir http://localhost:3001/auth/google
# 2. Google te demande la permission
# 3. Redirection vers /auth/google/callback?code=XXX&state=YYY
# 4. Response: { token: "eyJ...", user: { id, email, name, credits } }
```

## 5. Response Format

Success (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@gmail.com",
    "name": "John Doe",
    "credits": 10
  }
}
```

## 6. Production Setup

**Google Cloud Console:**
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/auth/google/callback`

**.env (prod):**
```bash
GOOGLE_CALLBACK_URL="https://yourdomain.com/auth/google/callback"
```

## Notes

- `googleId` from Google profile n'est pas stocké (email unique identifier)
- Nouveau user = bonus 10 crédits auto
- User existant (email connu) = login direct, sans nouveau bonus
- JWT valid 7 jours (JWT_EXPIRES_IN)
