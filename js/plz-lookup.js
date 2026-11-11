// Postcode -> centroid for Germany, Switzerland (incl. Liechtenstein) and Austria.
// Five digits are German. js/plz-de.js knows every German code to about 1 km; it is ~33 KB,
// so it loads only once someone uses the postcode field (window.loadPlzDe). A code the list
// does not know falls back to its three-digit region, then to the page's two-digit PLZ2 table,
// which also answers while the list is still loading.
// Four digits are Swiss or Austrian (js/plz-ch-at.js, first three digits). Most four-digit
// codes exist in both countries (8001 is Zürich, 8010 is Graz), so the caller passes the
// country the visitor picked; without a pick, Switzerland wins, it is where the trainers are.
// Returns { c: [lon, lat], country, countries } or null; `countries` lists every country
// that knows the code, so the page can offer the switch.
(function () {
  let de5 = null, de3 = null, loading = null;

  function decode() {
    const [P, X, Y] = window.PLZ_DE_PACKED;
    de5 = new Map();
    const sums = new Map();
    let code = 0;
    for (let i = 0; i < P.length; i++) {
      code += P[i];
      const c = [(X[i] + 580) / 100, (Y[i] + 4720) / 100];
      const key = String(code).padStart(5, '0');
      de5.set(key, c);
      const s = sums.get(key.slice(0, 3)) || [0, 0, 0];
      s[0] += c[0]; s[1] += c[1]; s[2]++;
      sums.set(key.slice(0, 3), s);
    }
    de3 = new Map();
    sums.forEach((s, k) => de3.set(k, [s[0] / s[2], s[1] / s[2]]));
    delete window.PLZ_DE_PACKED;
  }

  // Resolves once the German list is ready (or failed to load; lookups then use PLZ2).
  window.loadPlzDe = function () {
    if (de5) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'js/plz-de.js';
      s.onload = () => { try { decode(); } catch (e) { /* PLZ2 still answers */ } resolve(); };
      s.onerror = () => { loading = null; resolve(); };
      document.head.appendChild(s);
    });
    return loading;
  };

  window.plzLookup = function (digits, PLZ2, pick) {
    if (digits.length === 5) {
      const c = (de5 && (de5.get(digits) || de3.get(digits.slice(0, 3)))) || PLZ2[digits.slice(0, 2)];
      return c ? { c, country: 'DE', countries: ['DE'] } : null;
    }
    if (digits.length !== 4) return null;
    const key = digits.slice(0, 3);
    const tables = { CH: window.PLZ3_CH, AT: window.PLZ3_AT };
    const countries = Object.keys(tables).filter(k => tables[k][key]);
    if (!countries.length) return null;
    const country = countries.includes(pick) ? pick : countries[0];
    return { c: tables[country][key], country, countries };
  };
})();
