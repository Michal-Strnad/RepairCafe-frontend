# Repair Café – frontend

## Krok 04: Přihlášení přes Google

Tento balíček navazuje na krok 03. Přidává přihlášení přes Google Identity Services a propojení s existujícím backendovým endpointem `POST /auth/google`.

### Nastavení

1. V Google Cloud Console vytvořte OAuth 2.0 Client ID typu Web application.
2. Do Authorized JavaScript origins přidejte adresu frontendu (např. `http://localhost:5173`).
3. Na backendu nastavte `GOOGLE_CLIENT_ID` na stejné Client ID a `JWT_SECRET`.
4. Zkopírujte `.env.example` do `.env` a doplňte `VITE_GOOGLE_CLIENT_ID`. `VITE_API_URL` nastavte na adresu backendu.
5. Spusťte `npm install` a `npm run dev`.

### Co je implementováno

- Google přihlašovací tlačítko na `/login`.
- Odeslání Google ID tokenu do `POST /auth/google`.
- Očekávání odpovědi `{ token, user }` a uložení JWT + uživatele do `localStorage`.
- Základní stav přihlášení dostupný přes `useAuth()`.
- Chybové hlášky při neúspěšném přihlášení.

### Omezení a navazující práce

- Microsoft a Apple poskytovatelé nejsou součástí tohoto kroku.
- Toto přihlášení samo o sobě ještě nechrání aplikační routy; autorizaci a role-based navigaci doplníme v dalším kroku.
- Backendový endpoint `/auth/google` v dodaném zdrojovém kódu obsahuje chybu při vytváření nového uživatele: používá `result.id` a `result.role`, ačkoliv MySQL INSERT vrací `insertId` a roli je nutné nastavit explicitně. Opravu je nutné provést v backendu (viz `backend-patch/auth.js`).
- Token se pro školní prototyp ukládá do localStorage. Pro produkční aplikaci je vhodné zvážit bezpečnější správu session.

### Doporučený commit

```text
feat: add Google OAuth sign-in
```

### Formátování kódu

Projekt používá Prettier pro jednotné formátování JavaScriptu, JSX, CSS a dalších podporovaných souborů.

Po instalaci závislostí spusťte ve složce `frontend`:

```bash
npm install
npm run format
```

Kontrola, zda je kód naformátovaný, bez provedení změn:

```bash
npm run format:check
```

Nastavení formátování je v `.prettierrc.json`; složky `node_modules` a `dist` se ignorují.
