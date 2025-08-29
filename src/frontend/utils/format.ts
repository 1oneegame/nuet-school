// Форматирование времени
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Форматирование даты
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Форматирование процента
export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Сокращение текста
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Форматирование имени файла из URL
export const getFileNameFromUrl = (url: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

// Форматирование сложности
export const formatDifficulty = (difficulty: string): string => {
  const map: Record<string, string> = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный',
  };

  return map[difficulty] || difficulty;
};

// Форматирование типа ресурса
export const formatResourceType = (type: string): string => {
  const map: Record<string, string> = {
    book: 'Книга',
    article: 'Статья',
    video: 'Видео',
    website: 'Веб-сайт',
    tool: 'Инструмент',
    other: 'Другое',
  };

  return map[type] || type;
};

// Генерация случайного ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};