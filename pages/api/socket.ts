import { NextApiRequest, NextApiResponse } from 'next';
import { initializeWebSocket } from '../../src/lib/websocket';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    // Initialize WebSocket server
    initializeWebSocket(res);
    res.status(200).json({ message: 'WebSocket server initialized' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;