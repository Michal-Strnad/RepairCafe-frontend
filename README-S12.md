# S12 – Kalendář oprav dobrovolníka

Doplněna stránka `/my-repairs/calendar` podle návrhu kalendáře Repair Café.

## Funkce

- Měsíční, týdenní a denní zobrazení.
- Navigace na předchozí/následující období a tlačítko Dnes.
- Zvýraznění aktuálního dne.
- Zobrazení naplánovaných oprav v příslušných dnech včetně času a názvu.
- Kliknutí na událost otevře detail požadavku.
- Kliknutí na datum přepne na denní pohled.
- Ošetřeno načítání, prázdný kalendář, chyby API a nepřihlášený uživatel.
- Odkaz do kalendáře je také na stránce `/my-repairs`.

## Backendový kontrakt

Kalendář používá stejný endpoint jako S11:

`GET /volunteer/repairs`

Hlavička: `Authorization: Bearer <JWT>`.

Odpověď může být pole oprav nebo objekt `{ "repairs": [...] }`. Pro zobrazení události musí položka obsahovat datum v jednom z polí `scheduledAt`, `scheduledDate`, `repairDate`, `date` nebo `appointment.start`. Volitelný konec termínu může být v `appointment.end`, `scheduledEnd` nebo `endAt`. Název se čte z `title` nebo `request.title`; identifikátor detailu z `requestId`, `id` nebo `_id`. Položky označené stavem `completed`, `done`, `closed`, `finished`, `uzavreno`, `dokončeno` nebo `dokonceno` se v kalendáři nezobrazují.

Backend musí ověřit roli dobrovolníka a vracet pouze opravy přiřazené přihlášenému uživateli. Pokud backend používá jiný formát termínu nebo jinou strukturu odpovědi, bude nutné upravit mapování v `RepairsCalendarPage.jsx`.

Doporučený commit: `feat: add volunteer repairs calendar`
