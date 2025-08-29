import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../backend/lib/dbConnect';
import Material from '../../../../backend/models/Material';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Get only visible PDF materials for students
    const materials = await Material.find({
      isVisible: true,
      category: 'document',
      fileType: { $regex: /pdf/i }
    })
    .select('title description filePath fileSize originalName uploadedAt')
    .sort({ uploadedAt: -1 });

    // Format materials for student view
    const formattedMaterials = materials.map(material => ({
      id: material._id,
      title: material.title,
      description: material.description,
      fileName: material.originalName,
      fileSize: formatFileSize(material.fileSize),
      filePath: material.filePath,
      uploadedAt: material.uploadedAt
    }));

    return res.status(200).json({
      success: true,
      data: formattedMaterials
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при получении материалов'
    });
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}