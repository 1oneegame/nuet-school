const mongoose = require('mongoose');

async function checkModules() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nuet-app');
    console.log('Connected to MongoDB');
    
    const modules = await mongoose.connection.db.collection('modules').find({}).toArray();
    console.log('Found', modules.length, 'modules:');
    
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.lessons ? module.lessons.length : 0} lessons)`);
      if (module.lessons) {
        module.lessons.forEach((lesson, lessonIndex) => {
          console.log(`   - ${lesson.title} (Theory: ${lesson.theoryPdf ? 'Yes' : 'No'}, Homework: ${lesson.homeworkPdf ? 'Yes' : 'No'})`);
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Connection closed');
  }
}

checkModules();