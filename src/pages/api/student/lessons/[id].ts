import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../backend/lib/dbConnect';
import Module from '../../../../backend/models/Module';
import { Types } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    await dbConnect();
    
    // Find the module that contains the lesson
    const module = await Module.findOne({
      'lessons._id': new Types.ObjectId(id)
    });

    if (!module) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Find the specific lesson within the module
    const lesson = module.lessons.find((l: any) => l._id.toString() === id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Format materials from uploaded files
    const materials = [];
    let materialId = 1;

    if (lesson.theoryPdf) {
      materials.push({
        id: materialId++,
        title: 'Теоретический материал',
        type: 'pdf',
        size: 'PDF файл',
        downloadUrl: lesson.theoryPdf
      });
    }

    if (lesson.homeworkPdf) {
      materials.push({
        id: materialId++,
        title: 'Домашнее задание',
        type: 'pdf',
        size: 'PDF файл',
        downloadUrl: lesson.homeworkPdf
      });
    }

    // Format the lesson data for the frontend
    const lessonData = {
      id: lesson._id,
      title: lesson.title,
      duration: lesson.duration || '30 мин',
      videoUrl: lesson.videoUrl || '',
      theory: {
        title: lesson.title,
        content: lesson.theory ? lesson.theory.split('\n').filter((p: string) => p.trim()) : [
          'Теоретический материал для этого урока пока не загружен.',
          'Обратитесь к преподавателю для получения дополнительной информации.'
        ],
        keyPoints: lesson.keyPoints || [
          'Ключевые моменты будут добавлены позже'
        ]
      },
      materials: materials,
      moduleTitle: module.title,
      moduleId: module._id,
      theoryPdf: lesson.theoryPdf || null,
      homeworkPdf: lesson.homeworkPdf || null
    };

    res.status(200).json(lessonData);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}