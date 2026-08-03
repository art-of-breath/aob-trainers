# Art of Breath — Trainer-Website (Deploy-Kopie)

Statische Website. Kein Build-Schritt, kein Framework. Der Ordner selbst ist das, was gehostet
wird: `index.html` ist die Einstiegsseite.

## Seiten

| Datei | Was |
|---|---|
| `index.html` | Startseite |
| `trainers-map.html` | Trainer-Übersicht mit Karte |
| `impressum.html` | Impressum |
| `datenschutz.html` | Datenschutzerklärung |
| `graduates.html` | Absolventen. **Noch nicht veröffentlicht**, siehe unten. |

## Absolventen-Seite

`graduates.html` liegt im Repo, ist aber aus der Navigation von `index.html` und
`trainers-map.html` entfernt. Die Seite ist über die direkte URL erreichbar, also nicht
vertraulich, nur unverlinkt. Wenn sie live gehen soll, den Nav-Eintrag in beiden Seiten wieder
einsetzen:

```html
<a class="nav-link" href="graduates.html">Absolventen</a>
```

## Cookie-Banner und Google Analytics

`js/cookie-consent.js` liegt auf jeder Seite und bringt Banner, Styles und Markup selbst mit.
Vor Google geht nichts raus, bevor der Besucher "Akzeptieren" klickt: In keiner HTML-Datei steht
ein gtag-Tag, das Script-Element wird erst in `loadAnalytics()` erzeugt.

**Vor dem Launch:** in `js/cookie-consent.js` die Konstante `MEASUREMENT_ID` von
`G-XXXXXXXXXX` auf die echte GA4-ID setzen. Solange der Platzhalter drinsteht, wird die
Zustimmung zwar gespeichert, aber nichts geladen.

## Assets

Alles, was zur Laufzeit geladen wird, liegt im Repo. Keine CDN- oder Google-Fonts-Requests mehr:

- `fonts/` — Playfair Display und Raleway als woff2, eingebunden über `css/fonts.css`,
  dazu die beiden OFL-Lizenztexte
- `js/maplibre-gl.js` und `css/maplibre-gl.css` — MapLibre GL 4.7.1 für die Karte,
  Lizenz in `js/maplibre-gl.LICENSE.txt`
- `images/` — nur die Bilder, die die Seiten tatsächlich referenzieren
- `trainers/images/cards/` — die Trainer-Portraits für Karte und Übersicht

Athelas wird im Font-Stack zuerst genannt, aber nirgends ausgeliefert. Auf macOS und iOS ist sie
installiert und wird benutzt, auf allen anderen Systemen greift Playfair Display.

`vercel.json` setzt nur einen langen Cache-Header für `/fonts/`.

Die Kartenkacheln kommen von [openfreemap.org](https://openfreemap.org). Das ist die einzige
externe Verbindung zur Laufzeit, siehe Datenschutzerklärung § 7.

## Herkunft

Kopie aus `projects/2026-07-aob-trainers-website/`. Dort liegen die Quelldateien: Trainer-Profile
als Markdown, Copy-Entwürfe, Design-Notizen, Logo-Varianten und die Bild-Originale. Änderungen
gehören zuerst dorthin, dann in diese Kopie.
