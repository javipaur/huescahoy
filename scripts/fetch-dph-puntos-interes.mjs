import fs from 'node:fs/promises';

const URL = 'https://datosabiertos.dphuesca.es/dataset/39ebf06f-30d9-4a73-851a-5c631a79c590/resource/928c6137-da9a-44bf-bce7-9d788f29c7ce/download/puntosdeinteres.csv';
const res = await fetch(URL, { headers: { 'user-agent': 'HuescaHoy/1.0' } });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
// try utf8, fallback latin1
let text = buf.toString('utf8');
if (text.includes('\uFFFD') || /Ã|Â/.test(text)) text = buf.toString('latin1');

function parseCSV(input) {
  const rows = [];
  let row = [], cur = '', inQ = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQ) {
      if (ch === '"' && input[i+1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n') { row.push(cur.replace(/\r$/, '')); if (row.some(c=>c.trim())) rows.push(row); row=[]; cur=''; }
      else cur += ch;
    }
  }
  if (cur.length || row.length) { row.push(cur.replace(/\r$/, '')); if (row.some(c=>c.trim())) rows.push(row); }
  return rows;
}

const rows = parseCSV(text);
const [header, ...data] = rows;
const idx = Object.fromEntries(header.map((h,i)=>[h.trim(), i]));
const items = data.map(r => ({
  name: (r[idx.Nombre]||'').trim(),
  category: (r[idx.Categoria]||'').trim(),
  locality: (r[idx.Localidad]||'').trim(),
  comarca: (r[idx.Comarca]||'').trim(),
  lat: (r[idx.Latitud]||'').trim(),
  lon: (r[idx.Longitud]||'').trim(),
})).filter(x => x.name);

const out = {
  source: URL,
  attribution: 'Diputación Provincial de Huesca - Datos Abiertos',
  fetchedAt: new Date().toISOString(),
  count: items.length,
  items,
};
await fs.mkdir('src/data', { recursive: true });
await fs.writeFile('src/data/puntos-interes-dph.json', JSON.stringify(out, null, 2), 'utf8');
console.log(`OK ${items.length} puntos -> src/data/puntos-interes-dph.json`);
