/* Kartenbeschriftung auf Deutsch.
   Der OpenFreeMap-Stil „positron“ beschriftet Orte mit name_en (englisch, z. B. „Munich“).
   Nach dem Laden des Stils stellen wir jede Symbol-Ebene mit Namensfeld auf name:de um und
   fallen auf name:latin und den lokalen Namen zurück. Ebenen ohne Namensfeld (Autobahn-
   Schilder mit „ref“) bleiben unberührt. Eine Funktion für alle drei Karten. */
window.aobGermanLabels = function (map) {
  var TEXT = ['coalesce', ['get', 'name:de'], ['get', 'name:latin'], ['get', 'name']];
  var layers = map.getStyle().layers;
  for (var i = 0; i < layers.length; i++) {
    var l = layers[i];
    if (l.type !== 'symbol' || !l.layout || !l.layout['text-field']) continue;
    if (JSON.stringify(l.layout['text-field']).indexOf('name') === -1) continue;
    try { map.setLayoutProperty(l.id, 'text-field', TEXT); } catch (e) {}
  }
};
