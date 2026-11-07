// Pagina prodotto di prova: parte dal rendering reale del tema (raw-pdp.html), passa da build.js
// e sostituisce la galleria con una galleria "stile Amazon": miniature verticali a sinistra,
// foto grande che cambia al passaggio/click, zoom al passaggio del mouse.
const fs = require('fs');
const { execFileSync } = require('child_process');
execFileSync('node', ['build.js', 'raw-pdp.html', 'prodotto.html'], { stdio: 'inherit' });
let h = fs.readFileSync('prodotto.html', 'utf8');

const title = 'A. AMERICAN WHITE SANGALLO JUMPSUIT (pre-order)';
// figura intera, primo piano, profilo, schiena, dettaglio etichetta
const photos = [
  ['img/ago-sangallo-1.jpg', 'figura intera'],
  ['img/ago-sangallo-3.jpg', 'primo piano'],
  ['img/ago-sangallo-2.jpg', 'profilo'],
  ['img/ago-sangallo-4.jpg', 'schiena'],
  ['img/ago-sangallo-5.jpg', 'dettaglio etichetta'],
];

const css = `<style>
.ago-gallery{display:flex;gap:14px;justify-content:flex-start;align-items:flex-start;width:100%;position:sticky;top:calc(var(--header-height,80px) + 12px)}
.ago-gallery__thumbs{display:flex;flex-direction:column;gap:10px;flex:0 0 68px;order:2}
.ago-gallery__thumb{padding:0;border:1px solid transparent;background:none;cursor:pointer;aspect-ratio:2/3;overflow:hidden;opacity:.55;transition:opacity .15s,border-color .15s}
.ago-gallery__thumb img{display:block;width:100%;height:100%;object-fit:cover}
.ago-gallery__thumb:hover,.ago-gallery__thumb[aria-current="true"]{opacity:1}
.ago-gallery__thumb[aria-current="true"]{border-color:#000}
.ago-gallery__main{flex:0 1 auto;min-width:0;order:1;display:flex;justify-content:flex-start}
.ago-gallery__frame{position:relative;overflow:hidden;aspect-ratio:2/3;height:min(calc(100vh - var(--header-height,80px) - 40px),900px);max-width:100%;cursor:zoom-in;background:#f4f4f4}
.ago-gallery__frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .2s ease-out;will-change:transform}
.ago-gallery__frame.is-zoomed img{transform:scale(2.2)}
@media (max-width:749px){
  /* stessa logica del desktop: foto grande + miniature in colonna a destra */
  .ago-gallery{position:static;gap:8px}
  .ago-gallery__thumbs{flex:0 0 52px;gap:8px}
  .ago-gallery__main{flex:1 1 auto;min-width:0;display:block}
  .ago-gallery__frame{height:auto;width:100%;cursor:default}
  .ago-gallery__frame.is-zoomed img{transform:none}
}
</style>`;

const thumbs = photos.map(([src, alt], i) => `<button type="button" class="ago-gallery__thumb" data-i="${i}" aria-label="Foto ${i + 1}: ${alt}"${i === 0 ? ' aria-current="true"' : ''}><img src="${src}" alt="" loading="${i ? 'lazy' : 'eager'}"></button>`).join('\n');

const gallery = `<div class="ago-gallery sticky-content" data-ago-gallery>
<div class="ago-gallery__thumbs" role="group" aria-label="Foto del prodotto">
${thumbs}
</div>
<div class="ago-gallery__main"><div class="ago-gallery__frame"><img src="${photos[0][0]}" alt="${title} - ${photos[0][1]}" fetchpriority="high"></div></div>
</div>
<script>
(function(){
  var root=document.querySelector('[data-ago-gallery]'); if(!root) return;
  var data=${JSON.stringify(photos.map(([s, a]) => ({ src: s, alt: `${title} - ${a}` })))};
  var frame=root.querySelector('.ago-gallery__frame'), img=frame.querySelector('img');
  var thumbs=[].slice.call(root.querySelectorAll('.ago-gallery__thumb'));
  function show(i){var d=data[i]; img.src=d.src; img.alt=d.alt; thumbs.forEach(function(t,k){if(k===i)t.setAttribute('aria-current','true');else t.removeAttribute('aria-current');});}
  var canHover=window.matchMedia('(hover:hover) and (min-width:750px)').matches;
  thumbs.forEach(function(t,i){t.addEventListener('click',function(){show(i)}); if(canHover)t.addEventListener('mouseenter',function(){show(i)});});
  if(canHover){
    frame.addEventListener('mouseenter',function(){frame.classList.add('is-zoomed')});
    frame.addEventListener('mouseleave',function(){frame.classList.remove('is-zoomed');img.style.transformOrigin='50% 50%'});
    frame.addEventListener('mousemove',function(e){var r=frame.getBoundingClientRect();img.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%';});
  }
})();
</script>`;

const m0 = h.indexOf('<media-gallery');
const m1 = h.indexOf('</media-gallery>', m0) + '</media-gallery>'.length;
if (m0 < 0 || m1 < m0) throw new Error('media-gallery non trovata');
h = h.slice(0, m0) + gallery + h.slice(m1);
h = h.replace('</head>', css + '</head>');
fs.writeFileSync('prodotto.html', h);
console.log('galleria stile Amazon con', photos.length, 'foto');
