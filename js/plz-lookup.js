// Postcode -> region centroid for Germany, Switzerland (incl. Liechtenstein) and Austria.
// Five digits are German and use the page's PLZ2 table (first two digits). Four digits are
// Swiss or Austrian (js/plz-ch-at.js, first three digits). Most four-digit codes exist in
// both countries (8001 is Zürich, 8010 is Graz), so the caller passes the country the
// visitor picked; without a pick, Switzerland wins, it is where the trainers are.
// Returns { c: [lon, lat], country, countries } or null; `countries` lists every country
// that knows the code, so the page can offer the switch.
window.plzLookup = function (digits, PLZ2, pick) {
  if (digits.length === 5) {
    const c = PLZ2[digits.slice(0, 2)];
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
