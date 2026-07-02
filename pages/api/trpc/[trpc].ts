import type { NextApiRequest, NextApiResponse } from 'next';
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers';
import { createContext } from '../../../server/_core/context';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return createNextApiHandler({
    router: appRouter,
    createContext: async () => await createContext({ req, res }),
    onError({ error }) {
      console.error('tRPC error', error);
    }
  })(req, res);
}
