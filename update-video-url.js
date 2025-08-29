const { MongoClient, ObjectId } = require('mongodb');

async function updateVideoUrl() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('nuet_platform');
    const collection = db.collection('modules');
    
    // First, let's find the module to see its structure
    const module = await collection.findOne({ _id: new ObjectId('68aee0fd04d75e0a4d4747a3') });
    console.log('Found module:', module ? module.title : 'null');
    
    if (module) {
      console.log('Module lessons:', module.lessons.length);
      const lesson = module.lessons.find(l => l._id.toString() === '68aee0fd04d75e0a4d4747a4');
      console.log('Found lesson:', lesson ? lesson.title : 'null');
      console.log('Current videoUrl:', lesson ? lesson.videoUrl : 'null');
    }
    
    // Update the lesson with the correct video URL
    const result = await collection.updateOne(
      { 
        _id: new ObjectId('68aee0fd04d75e0a4d4747a3'),
        'lessons._id': new ObjectId('68aee0fd04d75e0a4d4747a4')
      },
      { 
        $set: { 
          'lessons.$.videoUrl': '/uploads/lessons/06de6918-f3e8-4549-a467-076ad7733d29.mp4',
          'lessons.$.updatedAt': new Date()
        } 
      }
    );
    
    console.log('Update result:', result);
    
    if (result.modifiedCount > 0) {
      console.log('Video URL updated successfully!');
    } else {
      console.log('No documents were modified');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateVideoUrl();