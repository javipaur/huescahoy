import fs from 'node:fs/promises';

const URL = 'https://huesca.city/negocios';
const html = await fetch(URL, {
  headers: { 'user-agent': 'HuescaHoy/1.0 (+https://huescahoy.javierpalacio.es)' }
}).then(r => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
});

const m = html.match(/<main id="seo">([\s\S]*?)<\/main>/);
if (!m) throw new Error('No se encontró el bloque SEO');
const seo = m[1];
const liRe = /<li><a href="(\/negocios\/[^"]+)"><strong>([\s\S]*?)<\/strong><\/a><br><small>([\s\S]*?)<\/small>(?:<br>([\s\S]*?))?<\/li>/g;

function decode(s='') {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const items = [];
let match;
while ((match = liRe.exec(seo))) {
  const [, href, name, meta, desc] = match;
  const metaDecoded = decode(meta);
  const parts = metaDecoded.split(' · ');
  const category = parts[0] ? parts[0].trim() : '';
  const address = parts.slice(1).join(' · ').trim();
  items.push({
    slug: href.replace('/negocios/', ''),
    name: decode(name),
    category,
    address,
    description: decode(desc || ''),
    source: 'huesca.city',
    sourceUrl: `https://huesca.city${href}`,
  });
}

const out = {
  source: 'https://huesca.city/negocios',
  fetchedAt: new Date().toISOString(),
  count: items.length,
  items,
};

await fs.mkdir('src/data', { recursive: true });
await fs.writeFile('src/data/comercios-huesca.json', JSON.stringify(out, null, 2), 'utf8');
console.log(`OK ${items.length} comercios -> src/data/comercios-huesca.json`);
