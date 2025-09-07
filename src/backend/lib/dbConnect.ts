import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuet-app';

if (!MONGODB_URI) {
  throw new Error(
    'Пожалуйста, определите переменную окружения MONGODB_URI в .env.local'
  );
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: CachedConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: isProduction ? 10000 : 5000,
      socketTimeoutMS: isProduction ? 60000 : 45000,
      maxPoolSize: isProduction ? 20 : 10,
      minPoolSize: isProduction ? 5 : 2,
      retryWrites: true,
      w: 'majority' as const,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB подключен успешно');
      return mongoose;
    }).catch((error) => {
      console.error('❌ Ошибка подключения к MongoDB:', error.message);
      cached.promise = null;
      
      if (isProduction) {
        throw new Error(`Database connection failed: ${error.message}`);
      } else {
        throw new Error('❌ Не удалось подключиться к MongoDB. Убедитесь, что MongoDB запущен на localhost:27017');
      }
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Database connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;