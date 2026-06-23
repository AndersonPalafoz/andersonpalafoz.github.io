import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const keyParts = req.query.path;
  const key = Array.isArray(keyParts) ? keyParts.join('/') : String(keyParts || '');
  if (!key) {
    res.status(400).send('Missing storage key');
    return;
  }
  const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
  const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
  if (!FORGE_API_KEY || !FORGE_API_URL) {
    res.status(500).send('Storage proxy not configured');
    return;
  }
  try {
    const forgeUrl = new URL('v1/storage/presign/get', FORGE_API_URL.replace(/\/+$/, '') + '/');
    forgeUrl.searchParams.set('path', key);
    const forgeResp = await fetch(forgeUrl.toString(), {
      headers: { Authorization: `Bearer ${FORGE_API_KEY}` }
    });
    if (!forgeResp.ok) {
      const body = await forgeResp.text().catch(() => '');
      console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
      res.status(502).send('Storage backend error');
      return;
    }
    const { url } = await forgeResp.json();
    if (!url) {
      res.status(502).send('Empty signed URL from backend');
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(307, url);
  } catch (err) {
    console.error('[StorageProxy] failed:', err);
    res.status(502).send('Storage proxy error');
  }
}
