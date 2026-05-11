# AGENTS.md – Timea Skincare

Tento súbor je hlavný inštrukčný súbor pre Codex / coding agenta v tomto repozitári.

## Projekt
Budujeme modernú, profesionálnu a minimalistickú webstránku pre kozmetický salón Timea Skincare v Novej Bani.

Cieľ stránky:
- pôsobiť dôveryhodne, jemne, žensky a profesionálne,
- prezentovať služby kozmetického salónu,
- umožniť jednoduchú rezerváciu termínu,
- podporiť SEO pre lokálne vyhľadávanie v Novej Bani a okolí,
- prepojiť web s Instagramom, Facebookom, Google Maps a kontaktnými údajmi.

## Dôležité pravidlá
- Pred úpravou projektu si vždy prečítaj tieto súbory:
  - `PROJECT_BRIEF.md`
  - `TODO.md`
  - `CONTENT_DRAFT.md`
  - `SEO_GDPR_CHECKLIST.md`
- Nezačni veľké zmeny bez krátkeho plánu.
- Po každej väčšej zmene vysvetli, čo bolo upravené a ktoré súbory sa zmenili.
- Dizajn má byť minimalistický, jemný, profesionálny, nie preplácaný.
- Nepoužívaj náhodné výrazné farby mimo brand palety.
- Kód môže byť profesionálny, ale musí zostať prehľadný.
- Texty majú byť po slovensky.
- Nepoužívaj falošné recenzie, falošné fotky salónu ani falošné certifikáty.
- Pri chýbajúcich údajoch použi jasné TODO placeholdery, napríklad `[DOPLNIŤ ADRESU]`.
- Web musí byť responzívny: mobil, tablet, desktop.
- Každá stránka musí mať jasné CTA: rezervovať termín, kontaktovať salón alebo pozrieť služby.

## Technický smer
Preferovaný stack:
- Next.js
- TypeScript
- Tailwind CSS
- komponentový systém s čistou štruktúrou
- jednoduché CMS zatiaľ neriešiť, obsah môže byť v dátových súboroch
- GitHub ako záloha a verzovanie

Odporúčaná štruktúra:
- `app/` alebo `src/app/` podľa použitého Next.js setupu
- `components/`
- `data/`
- `lib/`
- `public/images/`
- `styles/`
- `PROJECT_BRIEF.md`
- `TODO.md`
- `CONTENT_DRAFT.md`
- `SEO_GDPR_CHECKLIST.md`

## Dizajn
Brand farby:
- Powder pink: `#d979a8`
- Soft blush: `#f6dce7`
- Warm white: `#faf8f6`
- Light gray: `#e8e8e5`
- Stone gray: `#8b8d88`
- Charcoal: `#242629`
- Leaf green: `#496b43`

Vizuálny pocit:
- moderný
- profesionálny
- ženský
- jemný
- minimalistický
- čistý priestor
- dôvera a pokoj

Používanie farieb:
- Warm white ako hlavné pozadie
- Soft blush / Powder pink ako brand prvky
- Charcoal na text
- Stone gray na sekundárny text
- Leaf green používať opatrne ako prírodný akcent

## Stránky
Vytvoriť viacstránkový web:
- Domov
- Služby
- Cenník
- Galéria
- Kontakt

## Funkcie
MVP verzia:
- hlavná stránka s hero sekciou
- služby
- cenník
- galéria / pred a po
- recenzie
- kontakt
- kontaktný formulár
- mapa
- tlačidlo rezervácie

Rezervácia:
- V prvej verzii môže byť jednoduché tlačidlo na kontakt / formulár.
- Neskôr doplniť plnohodnotný rezervačný systém.

## SEO
Dôležité lokálne kľúčové slová:
- kozmetika Nová Baňa
- kozmetický salón Nová Baňa
- ošetrenie pleti Nová Baňa
- úprava obočia Nová Baňa
- laminácia obočia Nová Baňa
- laminácia mihalníc Nová Baňa
- Timea Skincare
- Timea Polcová

## Kontrola pred dokončením
Pred ukončením každej úlohy skontroluj:
- či web funguje na mobile,
- či sú CTA tlačidlá viditeľné,
- či texty nepôsobia umelo,
- či nie sú použité neexistujúce údaje,
- či farby sedia s paletou,
- či stránka nepôsobí preplácane,
- či je zachovaná profesionálna úroveň.
