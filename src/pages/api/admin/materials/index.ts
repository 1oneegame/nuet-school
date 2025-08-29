import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../backend/lib/dbConnect';
import Material from '../../../../backend/models/Material';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Для POST запросов (загрузка файлов) отключаем bodyParser
const shouldDisableBodyParser = (req: NextApiRequest) => {
  return req.method === 'POST';
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materials');

// Создаем папку для загрузки, если она не существует
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getMaterials(req, res);
    case 'POST':
      return uploadMaterial(req, res);
    case 'PUT':
      return updateMaterial(req, res);
    case 'DELETE':
      return deleteMaterial(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Получить все материалы
async function getMaterials(req: NextApiRequest, res: NextApiResponse) {
  try {
    const materials = await Material.find().sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении материалов' });
  }
}

// Загрузить новый материал
async function uploadMaterial(req: NextApiRequest, res: NextApiResponse) {
  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    const [fields, files] = await form.parse(req);
    
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !title) {
      return res.status(400).json({ success: false, message: 'Файл и название обязательны' });
    }

    // Генерируем уникальное имя файла
    const fileExtension = path.extname(file.originalFilename || '');
    const fileName = `${uuidv4()}${fileExtension}`;
    const newFilePath = path.join(uploadDir, fileName);

    // Перемещаем файл
    fs.renameSync(file.filepath, newFilePath);

    // Определяем тип файла
    const fileType = file.mimetype || 'application/octet-stream';
    
    // Определяем категорию автоматически, если не указана
    let autoCategory = category || 'other';
    if (!category) {
      if (fileType.startsWith('image/')) autoCategory = 'image';
      else if (fileType.startsWith('video/')) autoCategory = 'video';
      else if (fileType.startsWith('audio/')) autoCategory = 'audio';
      else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) autoCategory = 'document';
    }

    // Сохраняем в базу данных
    const material = new Material({
      title,
      description: description || '',
      fileName,
      originalName: file.originalFilename || fileName,
      filePath: `/uploads/materials/${fileName}`,
      fileSize: file.size,
      fileType,
      category: autoCategory,
      isVisible: true
    });

    await material.save();

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ success: false, message: 'Ошибка при загрузке файла' });
  }
}

// Обновить материал
async function updateMaterial(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { materialId, title, description, category, isVisible } = req.body;

    if (!materialId) {
      return res.status(400).json({ success: false, message: 'ID материала обязателен' });
    }

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Материал не найден' });
    }

    // Обновляем поля
    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (category !== undefined) material.category = category;
    if (isVisible !== undefined) material.isVisible = isVisible;

    await material.save();

    res.status(200).json({ success: true, data: material });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ success: false, message: 'Ошибка при обновлении материала' });
  }
}

// Удалить материал
async function deleteMaterial(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id: materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({ success: false, message: 'ID материала обязателен' });
    }

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Материал не найден' });
    }

    // Удаляем файл с диска
    const fullFilePath = path.join(process.cwd(), 'public', material.filePath);
    if (fs.existsSync(fullFilePath)) {
      fs.unlinkSync(fullFilePath);
    }

    // Удаляем из базы данных
    await Material.findByIdAndDelete(materialId);

    res.status(200).json({ success: true, message: 'Материал успешно удален' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ success: false, message: 'Ошибка при удалении материала' });
  }
}