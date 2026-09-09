# Art of Breath — Trainer-Website

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

## Wo dieses Repo hingehört

Dieses Repo ist **nur die Website**, keine Kopie von etwas anderem. Änderungen an den Seiten
passieren hier und nirgendwo sonst.

Es liegt als Unterordner `site/` in einem größeren Arbeitsordner, der nicht auf GitHub liegt und
auch nicht dorthin soll. Dort stehen die Trainer-Profile als Markdown, die Copy-Entwürfe, die
Design-Notizen, die Logo-Varianten und die Bild-Originale. Der Arbeitsordner ignoriert `site/`,
die beiden Repos kommen sich also nicht in die Quere.

**Alle Pfade in den Seiten sind relativ.** Das ist der Grund, warum die Vorschau unter
`https://art-of-breath.github.io/aob-trainers/` funktioniert, obwohl sie in einem Unterpfad
liegt. Ein absoluter Pfad wie `/css/fonts.css` würde auf der echten Domain weiter gut aussehen
und die Vorschau still zerlegen.

## Vorschau und Live

| Wo | Was |
|---|---|
| GitHub Pages | `https://art-of-breath.github.io/aob-trainers/`, aus `main`, Ordner `/ (root)`. Zum Herzeigen. |
| Vercel | Die echte Seite, aus demselben Repo, ebenfalls aus dem Root. |

Beide bauen nichts, sie liefern die Dateien aus, wie sie hier liegen.
