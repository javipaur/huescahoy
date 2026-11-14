import fs from 'node:fs/promises';

const LIST_URL = 'https://huesca.city/negocios';
const UA = 'HuescaHoy/1.0 (+https://huescahoy.javierpalacio.es)';
const CONCURRENCY = 6;

function decode(s = '') {
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

function extractMetaContent(html, attrName, attrValue) {
  const re = new RegExp(`<meta[^>]+${attrName}=["']${attrValue}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+${attrName}=["']${attrValue}["'][^>]*>`, 'i');
  const m = html.match(re);
  return decode(m?.[1] || m?.[2] || '');
}

function extractDetailData(html) {
  const ogImage = extractMetaContent(html, 'property', 'og:image') || extractMetaContent(html, 'name', 'twitter:image');
  let website = '';
  let image = ogImage;
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRe.exec(html))) {
    try {
      const parsed = JSON.parse(m[1]);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      const flat = [];
      for (const node of nodes) {
        if (node && typeof node === 'object' && Array.isArray(node['@graph'])) flat.push(...node['@graph']);
        else flat.push(node);
      }
      for (const node of flat) {
        if (!node || typeof node !== 'object') continue;
        if (!image && typeof node.image === 'string') image = node.image;
        else if (!image && node.image && typeof node.image === 'object' && typeof node.image.url === 'string') image = node.image.url;
        const sameAs = node.sameAs;
        const candidates = Array.isArray(sameAs) ? sameAs : typeof sameAs === 'string' ? [sameAs] : [];
        if (!website && typeof node.url === 'string' && !/huesca\.city\//.test(node.url)) website = node.url;
        for (const c of candidates) {
          if (typeof c === 'string' && /^https?:\/\//.test(c) && !/huesca\.city\//.test(c)) {
            website = c;
            break;
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return { image: image || '', website: website || '' };
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const html = await fetchText(LIST_URL);
const m = html.match(/<main id="seo">([\s\S]*?)<\/main>/);
if (!m) throw new Error('No se encontró el bloque SEO');
const seo = m[1];
const liRe = /<li><a href="(\/negocios\/[^"]+)"><strong>([\s\S]*?)<\/strong><\/a><br><small>([\s\S]*?)<\/small>(?:<br>([\s\S]*?))?<\/li>/g;

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
    image: '',
    website: '',
  });
}

let idx = 0;
async function worker() {
  while (idx < items.length) {
    const i = idx++;
    const item = items[i];
    try {
      const detail = await fetchText(item.sourceUrl);
      const extra = extractDetailData(detail);
      item.image = extra.image;
      item.website = extra.website;
    } catch (err) {
      console.error(`WARN ${item.slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
    if ((i + 1) % 25 === 0 || i + 1 === items.length) {
      console.log(`... ${i + 1}/${items.length}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

const out = {
  source: LIST_URL,
  fetchedAt: new Date().toISOString(),
  count: items.length,
  items,
};

await fs.mkdir('src/data', { recursive: true });
await fs.writeFile('src/data/comercios-huesca.json', JSON.stringify(out, null, 2), 'utf8');
const withImage = items.filter((i) => i.image).length;
console.log(`OK ${items.length} comercios (${withImage} con imagen) -> src/data/comercios-huesca.json`);
