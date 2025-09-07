import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      'Произошла ошибка при выполнении запроса';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Аутентификация
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (payload: any) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refresh: () => api.post('/auth/refresh'),
  verify: () => api.get('/auth/verify'),
};

// Курсы и видео
export const coursesAPI = {
  getCourses: () => api.get('/courses'),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  getTopic: (courseId: string, topicId: string) =>
    api.get(`/courses/${courseId}/topics/${topicId}`),
  getVideo: (courseId: string, topicId: string, videoId: string) =>
    api.get(`/courses/${courseId}/topics/${topicId}/videos/${videoId}`),
};

// Экзамены
export const examsAPI = {
  getExams: () => api.get('/exams'),
  getExam: (id: string) => api.get(`/exams/${id}`),
  startExam: (id: string) => api.post(`/exams/${id}/start`),
  submitExam: (id: string, answers: any) =>
    api.post(`/exams/${id}/submit`, { answers }),
  getResults: () => api.get('/exams/results'),
  getResult: (id: string) => api.get(`/exams/results/${id}`),
};

// Критическое мышление
export const criticalAPI = {
  // Получение задач
  getTasks: () => api.get('/critical'),
  getTask: (id: string) => api.get(`/critical/${id}`),
  
  // Получение экзаменов
  getExams: () => api.get('/critical-thinking/exams'),
  getExam: (id: string) => api.get(`/critical-thinking/exams/${id}`),
  
  // Создание и управление задачами (админ)
  createTask: (taskData: any) => api.post('/critical', taskData),
  updateTask: (id: string, taskData: any) => api.put(`/critical/${id}`, taskData),
  deleteTask: (id: string) => api.delete(`/critical/${id}`),
  
  // Результаты
  submitResult: (taskId: string, answer: string, timeSpent: number) =>
    api.post('/critical/results', { taskId, answer, timeSpent }),
  getResults: () => api.get('/critical/results'),
};

// Ресурсы
export const resourcesAPI = {
  getResources: () => api.get('/resources'),
  getResource: (id: string) => api.get(`/resources/${id}`),
};

// Админ API
export const adminAPI = {
  // Пользователи
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  createUser: (userData: any) => api.post('/admin/users', userData),
  updateUser: (id: string, userData: any) =>
    api.put(`/admin/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),


};

export const studentAPI = {
  getModules: () => api.get('/student/modules'),
  getLesson: (id: string | number) => api.get(`/student/lessons/${id}`),
  getMaterials: () => api.get('/student/materials'),
};

export default api;
