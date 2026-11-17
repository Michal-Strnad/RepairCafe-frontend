# Repair Café – frontend

## Krok 03: Přehled požadavků a detail požadavku

Tento balíček navazuje na krok 02 a obsahuje celý aktuální frontend.

### Nové funkce
- veřejný přehled dostupných požadavků (`/requests`)
- vyhledávání podle názvu, popisu a kategorie
- filtrování podle kategorie a řazení
- detail požadavku (`/requests/:id`)
- formulář pro vyjádření zájmu dobrovolníka s volitelnou zprávou
- upozornění, že kontaktní údaje zůstávají skryté

### Spuštění
```bash
npm install
npm run dev
```

### Testovací adresy
- `/` – úvodní stránka
- `/requests` – přehled požadavků
- `/requests/1` – detail ukázkového požadavku
- `/requests/new` – vytvoření požadavku

### Důležité omezení
Požadavky jsou zatím ukázková data v `src/data/requests.js`. Vyjádření zájmu se pouze potvrdí v prohlížeči; nic se neukládá do databáze ani neposílá na backend. Současný backend zatím neobsahuje potřebné endpointy pro požadavky a zájem dobrovolníků.

### Doporučený Git commit
```text
feat: add repair request listing and detail pages
```
