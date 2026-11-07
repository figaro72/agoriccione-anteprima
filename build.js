const fs = require('fs');
let h = fs.readFileSync(process.argv[2] || 'raw.html', 'utf8');
const PV = '3sjfcrxmusenrro3-41797550241.shopifypreview.com';
const CDN = 'https://cdn.shopify.com/s/files/1/0417/9755/0241/';

// 1. togli gli script di tracciamento/pixel/checkout di Shopify (non servono su una copia statica)
const bad = /preview-bar|monorail|trekkie|web-pixels|standard-events|shop-js|perf-kit|portable-wallets|checkouts\/internal|shopify_pay|storefront\/assets\/storefront|consent-tracking|ucp|shopify-features|__st\b/i;
let removed = 0;
h = h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => { if (bad.test(m) && !/importmap/i.test(m)) { removed++; return ''; } return m; });
h = h.replace(/<link\b[^>]*>/gi, (m) => (/portable-wallets|accelerated-checkout|shopify_pay|checkouts\/internal|\.well-known/i.test(m) ? '' : m));

// 2. indirizzi dei file -> CDN pubblico di Shopify
// raw.html scaricato da agoriccione.com/?preview_theme_id=... (vedi aggiorna.sh) ha i file su //agoriccione.com/cdn/:
// li porto alla stessa forma del vecchio dominio di anteprima, così valgono le regole sotto
h = h.split('//agoriccione.com/cdn/').join('//' + PV + '/cdn/');
h = h.split('//' + PV + '/cdn/shop/').join(CDN.replace('https:', '') );
h = h.split('https:' + CDN.replace('https:', '')).join(CDN);
h = h.replace(new RegExp('(https?:)?//' + PV.replace(/\./g, '\.') + '/cdn/fonts/', 'g'), 'https://fonts.shopifycdn.com/');
h = h.replace(new RegExp('(https?:)?//' + PV.replace(/\./g, '\.') + '/cdn/shopifycloud/', 'g'), 'https://cdn.shopify.com/shopifycloud/');
// anche le voci di srcset (dopo uno spazio o una virgola): sul telefono si usa la versione 2x/3x
h = h.replace(/(["'(\s,])\/cdn\/shopifycloud\//g, '$1https://cdn.shopify.com/shopifycloud/');
h = h.replace(/(["'(\s,])\/cdn\/shop\//g, '$1' + CDN);
h = h.replace(/(["'(\s,])\/cdn\/fonts\//g, '$1https://fonts.shopifycdn.com/');

// indirizzi senza "https:" davanti: li rendo espliciti (valgono ovunque, anche in locale)
h = h.replace(/([^:\w])\/\/cdn\.shopify\.com/g, '$1https://cdn.shopify.com');
h = h.replace(/([^:\w])\/\/cdn\.shopify\.com/g, '$1https://cdn.shopify.com'); // seconda passata: voci di srcset adiacenti
// 3. link interni inattivi (portano al negozio, non a questa copia)
h = h.replace(/href="(\/[^"]*|https:\/\/agoriccione\.com[^"]*|https?:\/\/[^"]*shopifypreview\.com[^"]*)"/g, 'href="#"');

// 4. non indicizzare
// 5. la copia statica non ha un negozio: le richieste alla stessa origine (carrello, sezioni, ricerca) falliscono subito,
//    così il tema non sostituisce parti della pagina con risposte sbagliate
const guard = '<script>(function(){var f=window.fetch;window.fetch=function(u){var s=typeof u==="string"?u:(u&&u.url)||"";if(s.indexOf("http")!==0||s.indexOf(location.origin)===0){return Promise.reject(new Error("anteprima statica"))}return f.apply(this,arguments)};var o=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(String(u).indexOf("http")!==0||String(u).indexOf(location.origin)===0){u="data:,"}return o.apply(this,arguments)}})();</script>';
h = h.replace('<head>', '<head>\n<meta name="robots" content="noindex, nofollow">\n<base target="_blank">\n' + guard);
fs.writeFileSync(process.argv[3] || 'index.html', h);
const left = (h.match(/shopifypreview\.com/g) || []).length;
console.log('script rimossi:', removed, '| riferimenti rimasti al dominio di anteprima:', left, '| dimensione:', h.length);
