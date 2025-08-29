import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import dbConnect from '../../../../backend/lib/dbConnect';
import Module from '../../../../backend/models/Module';
import { Types } from 'mongoose';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Ошибка подключения к базе данных' 
    });
  }

  if (req.method === 'GET') {
    const { moduleId } = req.query;
    
    try {
      if (moduleId) {
        const module = await Module.findById(moduleId);
        if (!module) {
          return res.status(404).json({ 
            success: false, 
            message: 'Модуль не найден' 
          });
        }
        return res.status(200).json({ success: true, data: module.lessons });
      }
      
      // Return all lessons from all modules
      const modules = await Module.find();
      const allLessons = modules.flatMap(m => m.lessons);
      return res.status(200).json({ success: true, data: allLessons });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при получении уроков' 
      });
    }
  }
  
  if (req.method === 'POST') {
    const { moduleId, title, duration, order = 0 } = req.body;
    
    if (!moduleId || !title || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID модуля, название и длительность обязательны' 
      });
    }
    
    try {
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ 
          success: false, 
          message: 'Модуль не найден' 
        });
      }
      
      const newLesson = {
        _id: new Types.ObjectId(),
        title,
        duration,
        order,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      module.lessons.push(newLesson);
      await module.save();
      
      return res.status(201).json({ success: true, data: newLesson });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при создании урока' 
      });
    }
  }
  
  if (req.method === 'PUT') {
    const { moduleId, lessonId, title, duration, completed, videoUrl, theoryPdf, homeworkPdf } = req.body;
    
    if (!moduleId || !lessonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID модуля и урока обязательны' 
      });
    }
    
    try {
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ 
          success: false, 
          message: 'Модуль не найден' 
        });
      }
      
      const lesson = module.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ 
          success: false, 
          message: 'Урок не найден' 
        });
      }
      
      // Update lesson fields
      if (title !== undefined) lesson.title = title;
      if (duration !== undefined) lesson.duration = duration;
      if (completed !== undefined) lesson.completed = completed;
      if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
      if (theoryPdf !== undefined) lesson.theoryPdf = theoryPdf;
      if (homeworkPdf !== undefined) lesson.homeworkPdf = homeworkPdf;
      
      lesson.updatedAt = new Date();
      
      await module.save();
      
      return res.status(200).json({ success: true, data: lesson });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при обновлении урока' 
      });
    }
  }
  
  if (req.method === 'DELETE') {
    const { moduleId, lessonId } = req.body;
    
    if (!moduleId || !lessonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID модуля и урока обязательны' 
      });
    }
    
    try {
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ 
          success: false, 
          message: 'Модуль не найден' 
        });
      }
      
      const lesson = module.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ 
          success: false, 
          message: 'Урок не найден' 
        });
      }
      
      // Clean up uploaded files if they exist
      if (lesson.videoUrl) {
        const videoPath = path.join(process.cwd(), 'public', lesson.videoUrl);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      }
      if (lesson.theoryPdf) {
        const theoryPath = path.join(process.cwd(), 'public', lesson.theoryPdf);
        if (fs.existsSync(theoryPath)) {
          fs.unlinkSync(theoryPath);
        }
      }
      if (lesson.homeworkPdf) {
        const homeworkPath = path.join(process.cwd(), 'public', lesson.homeworkPdf);
        if (fs.existsSync(homeworkPath)) {
          fs.unlinkSync(homeworkPath);
        }
      }
      
      lesson.deleteOne();
      await module.save();
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при удалении урока' 
      });
    }
  }
  
  return res.status(405).json({ success: false, message: 'Метод не поддерживается' });
}