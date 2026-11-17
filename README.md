# Repair Café – krok 02: Vytvoření požadavku na opravu

Tento balíček obsahuje celý frontendový projekt po kroku 02. Navazuje na krok 01 a přidává formulář pro zadání nové opravy.

## Nové funkce
- veřejná stránka formuláře na `/requests/new`
- název požadavku, kategorie a popis problému
- volitelná fotografie (výběr souboru v prohlížeči)
- kontaktní e-mail a volitelný telefon
- základní HTML validace povinných polí
- potvrzovací obrazovka po odeslání formuláře
- odkazy na formulář z úvodní stránky

## Spuštění

```bash
npm install
npm run dev
```

## Důležité omezení
Formulář je zatím pouze frontendový prototyp. Data se neposílají na server ani neukládají do databáze. V aktuálním backendu není endpoint pro vytvoření požadavku na opravu. Po doplnění API se formulář napojí na skutečné ukládání.

## Doporučený Git commit

```text
feat: add repair request creation form
```

## Přechod z kroku 01
Tento ZIP obsahuje kompletní stav projektu po kroku 02. Pro pokračování nahraďte obsah pracovní složky obsahem tohoto ZIPu; nepřepisujte `.git` složku, pokud už máte projekt inicializovaný jako Git repozitář.
