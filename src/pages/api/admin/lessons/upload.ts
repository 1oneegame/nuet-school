import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '../../../../backend/lib/dbConnect';
import Module from '../../../../backend/models/Module';
import { Types } from 'mongoose';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'lessons');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Upload API handler called with method:', req.method);
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    await dbConnect();

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 1024 * 1024 * 1024, // 1GB limit for videos
      maxTotalFileSize: 2 * 1024 * 1024 * 1024, // 2GB total limit
      allowEmptyFiles: false,
      minFileSize: 1024, // Minimum 1KB
      multiples: true,
      filename: (name, ext, part) => {
        // Generate unique filename
        const uniqueName = `${uuidv4()}${ext}`;
        return uniqueName;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        
        // Handle specific formidable errors
        let errorMessage = 'Ошибка при обработке файлов';
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'Файл слишком большой. Максимальный размер: 1GB';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          errorMessage = 'Слишком много файлов для загрузки';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = 'Неожиданный тип файла';
        } else if (err.message.includes('maxFileSize')) {
          errorMessage = 'Размер файла превышает допустимый лимит (1GB)';
        } else if (err.message.includes('maxTotalFileSize')) {
          errorMessage = 'Общий размер файлов превышает лимит (2GB)';
        }
        
        return res.status(400).json({ 
          success: false, 
          message: errorMessage,
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      try {
        const { lessonId } = fields;
        let lessonIdStr: string;
        
        // Handle lessonId which might be an array
        if (Array.isArray(lessonId)) {
          lessonIdStr = lessonId[0] as string;
        } else if (lessonId) {
          lessonIdStr = lessonId as string;
        } else {
          lessonIdStr = '';
        }
        
        if (!lessonIdStr) {
          return res.status(400).json({ 
            success: false, 
            message: 'ID урока обязателен' 
          });
        }

        console.log('Received lessonId:', lessonIdStr);

        // Validate ObjectId format
        if (!Types.ObjectId.isValid(lessonIdStr)) {
          console.log('Invalid ObjectId format:', lessonIdStr);
          return res.status(400).json({ 
            success: false, 
            message: 'Неверный формат ID урока' 
          });
        }

        // Find module containing the lesson
        console.log('Searching for lesson with ObjectId:', new Types.ObjectId(lessonIdStr));
        const module = await Module.findOne({
          'lessons._id': new Types.ObjectId(lessonIdStr)
        });

        console.log('Found module:', module ? module.title : 'null');

        if (!module) {
          return res.status(404).json({ 
            success: false, 
            message: 'Урок не найден' 
          });
        }

        // Find the lesson and update it
        const lesson = module.lessons.id(lessonIdStr);
        if (!lesson) {
          return res.status(404).json({ 
            success: false, 
            message: 'Урок не найден в модуле' 
          });
        }
        
        // Process uploaded files
        // Handle video upload
        if (files.video) {
          const videoFile = Array.isArray(files.video) ? files.video[0] : files.video;
          const videoPath = `/uploads/lessons/${path.basename(videoFile.filepath)}`;
          
          // Validate video file type
          const allowedVideoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp', '.ogv'];
          const allowedVideoMimeTypes = [
            'video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 
            'video/x-flv', 'video/webm', 'video/x-matroska', 'video/x-m4v',
            'video/3gpp', 'video/ogg'
          ];
          
          const videoExt = path.extname(videoFile.originalFilename || '').toLowerCase();
          const videoMime = videoFile.mimetype || '';
          
          if (!allowedVideoExtensions.includes(videoExt) && !allowedVideoMimeTypes.includes(videoMime)) {
            // Clean up uploaded file
            fs.unlinkSync(videoFile.filepath);
            return res.status(400).json({ 
              success: false, 
              message: `Неподдерживаемый формат видео: ${videoExt}. Поддерживаемые форматы: ${allowedVideoExtensions.join(', ')}` 
            });
          }
          
          lesson.videoUrl = videoPath;
        }

        // Handle theory PDF upload
        if (files.theory) {
          const theoryFile = Array.isArray(files.theory) ? files.theory[0] : files.theory;
          const theoryPath = `/uploads/lessons/${path.basename(theoryFile.filepath)}`;
          
          // Validate PDF file type
          const theoryExt = path.extname(theoryFile.originalFilename || '').toLowerCase();
          if (theoryExt !== '.pdf') {
            // Clean up uploaded file
            fs.unlinkSync(theoryFile.filepath);
            return res.status(400).json({ 
              success: false, 
              message: 'Файл теории должен быть в формате PDF' 
            });
          }
          
          lesson.theoryPdf = theoryPath;
        }

        // Handle homework PDF upload
        if (files.homework) {
          const homeworkFile = Array.isArray(files.homework) ? files.homework[0] : files.homework;
          const homeworkPath = `/uploads/lessons/${path.basename(homeworkFile.filepath)}`;
          
          // Validate PDF file type
          const homeworkExt = path.extname(homeworkFile.originalFilename || '').toLowerCase();
          if (homeworkExt !== '.pdf') {
            // Clean up uploaded file
            fs.unlinkSync(homeworkFile.filepath);
            return res.status(400).json({ 
              success: false, 
              message: 'Файл домашнего задания должен быть в формате PDF' 
            });
          }
          
          lesson.homeworkPdf = homeworkPath;
        }

        // Update lesson timestamp and save module
        lesson.updatedAt = new Date();
        await module.save();

        // Find the updated lesson
        const updatedLesson = lesson;

        res.status(200).json({ 
          success: true, 
          message: 'Файлы успешно загружены',
          data: updatedLesson
        });

      } catch (processError) {
        console.error('Processing error:', processError);
        res.status(500).json({ 
          success: false, 
          message: 'Ошибка при обработке файлов' 
        });
      }
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
}