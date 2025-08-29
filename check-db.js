const mongoose = require('mongoose');
const { Schema } = mongoose;

// Схема урока (такая же как в seed-data.js)
const LessonSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  duration: { type: String, required: true, trim: true },
  videoUrl: { type: String, trim: true },
  theoryPdf: { type: String, trim: true },
  homeworkPdf: { type: String, trim: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Схема модуля (такая же как в seed-data.js)
const ModuleSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true },
  lessons: [LessonSchema],
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Module = mongoose.model('Module', ModuleSchema);

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/school240');
    console.log('Connected to MongoDB');
    
    const modules = await Module.find({});
    console.log('Found', modules.length, 'modules:');
    
    modules.forEach(module => {
      console.log('\nModule:', module.title);
      module.lessons.forEach(lesson => {
        console.log('  Lesson:', lesson.title, '(ID:', lesson._id + ')');
        console.log('    Theory PDF:', lesson.theoryPdf || 'Not uploaded');
        console.log('    Homework PDF:', lesson.homeworkPdf || 'Not uploaded');
      });
    });
    
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

checkDatabase();