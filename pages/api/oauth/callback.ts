import type { NextApiRequest, NextApiResponse } from 'next';
import { sdk } from '../../../server/_core/sdk';
import { upsertUser } from '../../../server/db';
import { serialize } from 'cookie';

const COOKIE_NAME = 'app_session_id';
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = Array.isArray(req.query.code) ? req.query.code[0] : req.query.code;
  const state = Array.isArray(req.query.state) ? req.query.state[0] : req.query.state;
  if (!code || !state) {
    res.status(400).json({ error: 'code and state are required' });
    return;
  }
  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code as string, state as string);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    if (!userInfo.openId) {
      res.status(400).json({ error: 'openId missing from user info' });
      return;
    }
    await upsertUser({
      openId: userInfo.openId,
      name: userInfo.name ?? null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date()
    });
    const sessionToken = await sdk.createSessionToken(userInfo.openId, { name: userInfo.name || '', expiresInMs: ONE_YEAR_MS });
    const cookie = serialize(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor(ONE_YEAR_MS / 1000)
    });
    res.setHeader('Set-Cookie', cookie);
    res.redirect(302, '/');
  } catch (error) {
    console.error('[OAuth] Callback failed', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
}
