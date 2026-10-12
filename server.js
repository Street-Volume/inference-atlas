import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory cache for scientific API responses
const scienceCache = new Map();
function getCached(key) {
  const item = scienceCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    scienceCache.delete(key);
    return null;
  }
  return item.data;
}
function setCached(key, data, ttlMs = 1000 * 60 * 15) {
  scienceCache.set(key, { data, expires: Date.now() + ttlMs });
}

// Exponential backoff fetcher following Science Skill guidelines
async function fetchWithRetry(url, options = {}, maxRetries = 3, baseDelayMs = 600) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        const retryAfter = Number(response.headers.get('Retry-After'));
        const delay = !Number.isNaN(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : baseDelayMs * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Exhausted retries for ${url}`);
}

// Science API: AlphaFold DB prediction metadata & coordinates
app.get('/api/science/alphafold/:id', async (req, res) => {
  const id = req.params.id.trim().toUpperCase();
  const cacheKey = `af_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const upstreamUrl = `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(id)}`;
    const response = await fetchWithRetry(upstreamUrl, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'InferenceAtlas/1.0' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `AlphaFold API returned ${response.status}` });
    }
    const data = await response.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch from AlphaFold DB', details: err.message });
  }
});

// Science API: RCSB PDB metadata
app.get('/api/science/pdb/:id', async (req, res) => {
  const id = req.params.id.trim().toUpperCase();
  const cacheKey = `pdb_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const upstreamUrl = `https://data.rcsb.org/rest/v1/core/entry/${encodeURIComponent(id)}`;
    const response = await fetchWithRetry(upstreamUrl, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'InferenceAtlas/1.0' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `RCSB PDB returned ${response.status}` });
    }
    const data = await response.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch from RCSB PDB', details: err.message });
  }
});

// Science API: PubChem Compound & Lipinski Properties
app.get('/api/science/pubchem/:name', async (req, res) => {
  const name = req.params.name.trim();
  const cacheKey = `pubchem_${name.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const upstreamUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/JSON`;
    const response = await fetchWithRetry(upstreamUrl, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'InferenceAtlas/1.0' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `PubChem returned ${response.status}` });
    }
    const data = await response.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch from PubChem', details: err.message });
  }
});

// Science API: Europe PMC Biomedical Literature
app.get('/api/science/europepmc', async (req, res) => {
  const query = req.query.query || 'AlphaFold';
  const pageSize = Math.min(25, parseInt(req.query.pageSize || '8', 10));
  const cacheKey = `epmc_${query}_${pageSize}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const upstreamUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=${pageSize}`;
    const response = await fetchWithRetry(upstreamUrl, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'InferenceAtlas/1.0' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `Europe PMC returned ${response.status}` });
    }
    const data = await response.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch from Europe PMC', details: err.message });
  }
});

// Serve static assets and HTML pages
app.use(express.static(__dirname, { extensions: ['html'] }));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Inference Atlas running at http://0.0.0.0:${PORT}`);
});
