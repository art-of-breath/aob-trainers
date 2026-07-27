# Art of Breath — Trainer-Website (Deploy-Kopie)

Statische Website. Kein Build-Schritt, kein Framework. Der Ordner selbst ist das, was gehostet
wird: `index.html` ist die Einstiegsseite.

## Seiten

| Datei | Was |
|---|---|
| `index.html` | Startseite |
| `trainers-map.html` | Trainer-Übersicht mit Karte |
| `graduates.html` | Absolventen. **Noch nicht veröffentlicht**, siehe unten. |

## Absolventen-Seite

`graduates.html` liegt im Repo, ist aber aus der Navigation von `index.html` und
`trainers-map.html` entfernt. Die Seite ist über die direkte URL erreichbar, also nicht
vertraulich, nur unverlinkt. Wenn sie live gehen soll, den Nav-Eintrag in beiden Seiten wieder
einsetzen:

```html
<a class="nav-link" href="graduates.html">Absolventen</a>
```

## Herkunft

Kopie aus `projects/2026-07-aob-trainers-website/`. Dort liegen die Quelldateien: Trainer-Profile
als Markdown, Copy-Entwürfe, Design-Notizen, Logo-Varianten und die Bild-Originale. Änderungen
gehören zuerst dorthin, dann in diese Kopie.

Enthalten ist hier nur, was zur Laufzeit geladen wird: die drei HTML-Seiten und die Bilder, die
sie tatsächlich referenzieren.

## Externe Abhängigkeiten

Beide werden zur Laufzeit vom CDN geladen, liegen also nicht im Repo:

- **MapLibre GL 4.7.1** (jsDelivr) für die Karte
- **Google Fonts**: Playfair Display, Raleway

Athelas wird in der Schrift-Stack zuerst genannt, aber nirgends ausgeliefert. Auf macOS und iOS
ist sie installiert und wird benutzt, auf allen anderen Systemen greift Playfair Display.
