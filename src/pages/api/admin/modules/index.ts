import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../backend/lib/dbConnect';
import Module from '../../../../backend/models/Module';

// Database connection will be established for each request

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
    try {
      const modules = await Module.find().sort({ order: 1, createdAt: 1 });
      return res.status(200).json({ success: true, data: modules });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при получении модулей' 
      });
    }
  }
  
  if (req.method === 'POST') {
    const { title, description, order = 0 } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Название и описание обязательны' 
      });
    }
    
    try {
      const newModule = new Module({
        title,
        description,
        order,
        lessons: []
      });
      
      await newModule.save();
      
      return res.status(201).json({ success: true, data: newModule });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при создании модуля' 
      });
    }
  }
  
  if (req.method === 'PUT') {
    const { id, title, description, order } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID модуля обязателен' 
      });
    }
    
    try {
      const updatedModule = await Module.findByIdAndUpdate(
        id,
        { title, description, order },
        { new: true, runValidators: true }
      );
      
      if (!updatedModule) {
        return res.status(404).json({ 
          success: false, 
          message: 'Модуль не найден' 
        });
      }
      
      return res.status(200).json({ success: true, data: updatedModule });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при обновлении модуля' 
      });
    }
  }
  
  if (req.method === 'DELETE') {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID модуля обязателен' 
      });
    }
    
    try {
      const deletedModule = await Module.findByIdAndDelete(id);
      
      if (!deletedModule) {
        return res.status(404).json({ 
          success: false, 
          message: 'Модуль не найден' 
        });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка при удалении модуля' 
      });
    }
  }
  
  return res.status(405).json({ success: false, message: 'Метод не поддерживается' });
}