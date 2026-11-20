# S13 – Správa uživatelů

## Co je doplněno
- Nová administrační stránka `/admin/users`.
- Odkaz „Správa uživatelů“ na úvodní stránce se zobrazuje pouze přihlášenému uživateli s rolí `admin`.
- Stránka načítá uživatele z backendu, nabízí vyhledávání podle jména, e-mailu, role a ID a zobrazuje profilový obrázek, roli a ID.
- Jsou ošetřeny stavy načítání, chyby a prázdný výsledek.

## Napojení na backend
Používá se existující endpoint:
- `POST /userSettings/getUsers`
- Hlavička: `Authorization: Bearer <JWT>`
- Odpověď: pole objektů s poli `id`, `name`, `role`, `email`, `picture`.

Backend ověřuje administrátorskou roli. Frontendová kontrola role slouží pouze pro navigaci a uživatelské rozhraní; není náhradou serverové autorizace.

## Ověření
ZIP archiv byl ověřen pomocí `unzip -t`. Instalace závislostí přes `npm ci` v tomto prostředí nedokončila běh v časovém limitu, proto nebylo možné potvrdit úspěšný Vite build.
