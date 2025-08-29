const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nuet-app')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const modules = await db.collection('modules').find({}, {
      projection: {
        title: 1,
        'lessons._id': 1,
        'lessons.title': 1
      }
    }).toArray();
    
    console.log('Modules and lessons:');
    modules.forEach(module => {
      console.log(`Module: ${module.title}`);
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          console.log(`  Lesson ID: ${lesson._id}, Title: ${lesson.title}`);
        });
      }
    });
    
    mongoose.disconnect();
  })
  .catch(console.error);