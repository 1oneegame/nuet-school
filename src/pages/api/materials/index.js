import connectDB from '../../../../backend/lib/mongodb';
import Material from '../../../../backend/models/Material';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      return getMaterials(req, res);
    case 'POST':
      return uploadMaterial(req, res);
    case 'DELETE':
      return deleteMaterial(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getMaterials(req, res) {
  try {
    const materials = await Material.find({})
      .sort({ uploadedAt: -1 })
      .lean();
    
    return res.status(200).json({ materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({ error: 'Failed to fetch materials' });
  }
}

async function uploadMaterial(req, res) {
  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'materials'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const isVisible = Array.isArray(fields.isVisible) ? fields.isVisible[0] === 'true' : fields.isVisible === 'true';
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file || !title) {
      return res.status(400).json({ error: 'File and title are required' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'unknown';
    const extension = path.extname(originalName);
    const fileName = `${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const newPath = path.join(uploadDir, fileName);
    
    // Move file to final location
    fs.renameSync(file.filepath, newPath);
    
    // Create material record
    const material = new Material({
      title,
      description: description || '',
      category: category || 'document',
      originalName,
      fileName,
      filePath: `/uploads/materials/${fileName}`,
      fileSize: file.size,
      fileType: file.mimetype || 'application/octet-stream',
      isVisible: isVisible !== undefined ? isVisible : true,
    });
    
    await material.save();
    
    return res.status(201).json({ 
      message: 'File uploaded successfully',
      material 
    });
  } catch (error) {
    console.error('Error uploading material:', error);
    return res.status(500).json({ error: 'Failed to upload material' });
  }
}

async function deleteMaterial(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Material ID is required' });
    }
    
    const material = await Material.findById(id);
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', material.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await Material.findByIdAndDelete(id);
    
    return res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return res.status(500).json({ error: 'Failed to delete material' });
  }
}