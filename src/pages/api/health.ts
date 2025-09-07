import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../backend/lib/dbConnect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  
  try {
    await dbConnect();
    res.status(200).json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error,
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
}
