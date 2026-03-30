# Campagne Presentatie Tool

Statische presentatiepagina voor Meta-advertenties (Facebook & Instagram). Eén HTML-bestand, geen frameworks — direct klaar voor GitHub Pages.

## Snel starten

1. Open `index.html` in je browser
2. De tool laadt automatisch `clients/uaf/campaign.json`
3. Voor een andere klant: `index.html?client=klantnaam`

## Mapstructuur

```
campaign-presentatie/
├── index.html
├── google-apps-script.js
├── README.md
└── clients/
    └── uaf/
        ├── campaign.json
        └── assets/
            ├── images/
            │   ├── uaf-sb-01.png
            │   └── ...
            └── logos/
                └── uaf.png
```

## campaign.json vullen

Elke klant krijgt een eigen map onder `clients/`. Het JSON-bestand bevat:

```json
{
  "client": "Klantnaam",
  "client_logo": "assets/logos/logo.png",
  "campaign_name": "Campagne titel",
  "campaign_brief": "Korte toelichting wat je test en voor wie.",
  "landing_pages": [
    { "label": "Variant A", "url": "https://..." }
  ],
  "ads": [
    {
      "id": "uniek-id",
      "image": "assets/images/bestand.png",
      "placement": "facebook_feed",
      "format": "1080x1080",
      "angle": "urgentie",
      "landing_page_url": "https://...",
      "copy": {
        "primary_text": "De advertentietekst",
        "headline": "Koptekst",
        "description": "Beschrijving",
        "cta": "Doneer nu"
      }
    }
  ]
}
```

### Velden

| Veld | Beschrijving |
|------|-------------|
| `placement` | `facebook_feed` of `instagram_feed` |
| `format` | `1080x1080` (feed), `1080x1920` (story), `1200x628` (landscape) |
| `angle` | Vrij tekstveld — wordt als filter en tag getoond |
| `image` | Pad relatief t.o.v. de klantmap |

## Afbeeldingen toevoegen

1. Plaats afbeeldingen in `clients/klantnaam/assets/images/`
2. Plaats het logo in `clients/klantnaam/assets/logos/`
3. Verwijs in `campaign.json` met relatieve paden: `"image": "assets/images/bestand.png"`

Als een afbeelding ontbreekt, toont de tool automatisch een placeholder met de headline.

## Vanuit Google Sheets naar JSON

De advertentiekolommen in je sheet moeten zijn:

| id | image | placement | format | angle | landing_page_url | primary_text | headline | description | cta |
|----|-------|-----------|--------|-------|------------------|--------------|----------|-------------|-----|

### Conversie-stappen

1. **Google Sheets**: Vul je ads in met bovenstaande kolommen
2. **Exporteer als CSV** of gebruik een Google Sheets JSON add-on (bijv. "Export Sheet Data")
3. **Converteer** de platte rijen naar het geneste `campaign.json` format:

```javascript
// Simpel Node.js script om platte CSV/JSON om te zetten
const rows = require('./ads-flat.json'); // array van objecten

const campaign = {
  client: "Klantnaam",
  client_logo: "assets/logos/logo.png",
  campaign_name: "Campagne titel",
  campaign_brief: "Beschrijving",
  landing_pages: [],
  ads: rows.map(row => ({
    id: row.id,
    image: row.image,
    placement: row.placement,
    format: row.format,
    angle: row.angle,
    landing_page_url: row.landing_page_url,
    copy: {
      primary_text: row.primary_text,
      headline: row.headline,
      description: row.description,
      cta: row.cta
    }
  }))
};

console.log(JSON.stringify(campaign, null, 2));
```

Run: `node convert.js > clients/klantnaam/campaign.json`

## Deployen naar GitHub Pages

```bash
# 1. Maak een repo aan (of gebruik een bestaande)
gh repo create mijn-org/campaign-presentatie --public

# 2. Push je bestanden
git add .
git commit -m "Add campaign presentation"
git push origin main

# 3. Activeer GitHub Pages
gh api repos/mijn-org/campaign-presentatie/pages -X POST -f source.branch=main -f source.path=/

# Of via GitHub: Settings → Pages → Source: main branch, / (root)
```

Je presentatie is dan bereikbaar op:
`https://mijn-org.github.io/campaign-presentatie/?client=uaf`

## Client feedback / goedkeuring

De tool heeft een ingebouwd feedbacksysteem waarmee klanten per advertentie kunnen goedkeuren of wijzigingen aangeven. Feedback wordt opgeslagen in een Google Sheet via Google Apps Script.

### Setup Google Apps Script

1. **Maak een Google Sheet aan** — deze wordt de database voor feedback
2. **Kopieer het Sheet-ID** uit de URL (het lange stuk tussen `/d/` en `/edit`)
3. **Ga naar [script.google.com](https://script.google.com)** en maak een nieuw project
4. **Plak de code** uit `google-apps-script.js` in het script-bestand (vervang de standaardcode)
5. **Vul het `SPREADSHEET_ID`** in bovenaan het script met jouw Sheet-ID
6. **Deploy** het script:
   - Klik **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. **Kopieer de deployment-URL**
8. **Vul de URL in** in je `campaign.json`:

```json
{
  "feedback_url": "https://script.google.com/macros/s/JOUW_DEPLOYMENT_ID/exec",
  ...
}
```

### Hoe het werkt

- Reviewers worden bij eerste interactie gevraagd om hun naam (opgeslagen in localStorage)
- Per advertentie kan "Goedgekeurd" of "Wijziging nodig" worden gekozen, met optioneel commentaar
- Alle feedback is zichtbaar per advertentie (chronologisch)
- Een samenvatting in de header toont: X goedgekeurd, Y wijziging nodig, Z nog niet beoordeeld
- Bij printen worden feedback-knoppen verborgen maar bestaande comments blijven zichtbaar
- Als `feedback_url` leeg is, toont de tool "Feedback nog niet geconfigureerd"

### Google Sheet structuur

Het script maakt automatisch een "Feedback" tabblad aan met deze kolommen:

| timestamp | client | ad_id | status | comment | reviewer_name |
|-----------|--------|-------|--------|---------|---------------|

## Features

- Realistische Facebook & Instagram feed mock-ups
- Filters op placement, angle en format
- Kopieer-knop voor alle ad copy
- Client feedback & goedkeuring per advertentie (via Google Sheets)
- Responsive (desktop + mobiel)
- Print-vriendelijk (Ctrl+P)
- Geen dependencies — één HTML-bestand
