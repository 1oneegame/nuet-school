import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../backend/lib/dbConnect';
import Module from '../../../backend/models/Module';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Fetch all modules with their lessons
    const modules = await Module.find().sort({ createdAt: 1 });
    
    // Format the data for the frontend
    const formattedModules = modules.map(module => ({
      id: module._id,
      title: module.title,
      description: module.description,
      lessons: module.lessons.map((lesson: any) => ({
        id: lesson._id,
        title: lesson.title,
        duration: lesson.duration || '30 мин',
        completed: lesson.completed || false
      }))
    }));

    res.status(200).json(formattedModules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}