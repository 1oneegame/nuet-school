import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUserRole } from '../../hooks/useUserRole';

interface EditableContentProps {
  children: React.ReactNode;
  contentType: 'video' | 'lesson' | 'quiz' | 'question' | 'module';
  contentId?: string | number;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  editButtonText?: string;
  deleteButtonText?: string;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

const EditableContent: React.FC<EditableContentProps> = ({
  children,
  contentType,
  contentId,
  onEdit,
  onDelete,
  className = '',
  editButtonText = 'Редактировать',
  deleteButtonText = 'Удалить',
  showEditButton = true,
  showDeleteButton = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { canEdit, loading } = useUserRole();

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Перенаправляем в админ панель для редактирования
      const editUrl = getEditUrl();
      if (editUrl) {
        router.push(editUrl);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      const confirmed = window.confirm(`Вы уверены, что хотите удалить этот ${getContentTypeName()}?`);
      if (confirmed) {
        onDelete();
      }
    }
  };

  const getEditUrl = (): string | null => {
    switch (contentType) {
      case 'video':
      case 'lesson':
      case 'module':
        return '/admin?section=courses';
      case 'quiz':
      case 'question':
        return '/admin?section=tests';
      default:
        return '/admin';
    }
  };

  const getContentTypeName = (): string => {
    switch (contentType) {
      case 'video':
        return 'видео';
      case 'lesson':
        return 'урок';
      case 'quiz':
        return 'тест';
      case 'question':
        return 'вопрос';
      case 'module':
        return 'модуль';
      default:
        return 'контент';
    }
  };

  if (loading) {
    return <div className={className}>{children}</div>;
  }

  if (!canEdit) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Кнопки редактирования появляются при наведении */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex space-x-2 z-10">
          {showEditButton && (
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors shadow-lg"
              title={`${editButtonText} ${getContentTypeName()}`}
            >
              ✏️ {editButtonText}
            </button>
          )}
          
          {showDeleteButton && (
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors shadow-lg"
              title={`${deleteButtonText} ${getContentTypeName()}`}
            >
              🗑️ {deleteButtonText}
            </button>
          )}
        </div>
      )}
      
      {/* Индикатор редактируемого контента */}
      {isHovered && (
        <div className="absolute top-0 left-0 w-full h-full border-2 border-blue-400 border-dashed rounded-lg pointer-events-none opacity-50"></div>
      )}
    </div>
  );
};

export default EditableContent;