import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';
import { adminAPI } from '@/utils/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  role: string;
  hasStudentAccess: boolean;
  isSchoolStudent: boolean;
  isEmailVerified: boolean;
  isWhatsAppVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  accessGrantedBy?: string;
  accessGrantedAt?: string;
  loginAttempts: number;
  isAccountLocked: boolean;
}

interface Statistics {
  totalUsers: number;
  verifiedUsers: number;
  usersWithAccess: number;
  adminUsers: number;
}

interface UsersPageProps {
  initialUsers: User[];
  initialStats: Statistics;
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const UsersPage: React.FC<UsersPageProps> = ({ 
  initialUsers, 
  initialStats, 
  initialPagination 
}) => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [stats, setStats] = useState<Statistics>(initialStats);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessReason, setAccessReason] = useState('');

  // Загрузка пользователей с фильтрами
  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({
        page,
        limit: 20,
        search: searchTerm,
        role: roleFilter,
        accessStatus: accessFilter,
      });
      setUsers(data.users);
      setStats(data.statistics);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обновление доступа пользователя
  const updateUserAccess = async (userId: string, hasAccess: boolean) => {
    try {
      await adminAPI.updateUser(userId, { hasStudentAccess: hasAccess, reason: accessReason });
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, hasStudentAccess: hasAccess }
          : user
      ));
      setShowAccessModal(false);
      setSelectedUser(null);
      setAccessReason('');
      loadUsers(currentPage);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка обновления доступа');
    }
  };

  // Обновление статуса ученика школы
  const updateSchoolStudentStatus = async (userId: string, isSchoolStudent: boolean) => {
    try {
      await adminAPI.updateUser(userId, { 
        isSchoolStudent, 
        reason: `Изменение статуса на ${isSchoolStudent ? 'ученик школы' : 'внешний пользователь'}` 
      });
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isSchoolStudent }
          : user
      ));
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка обновления статуса ученика');
    }
  };

  // Обработчики фильтров
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, accessFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusBadge = (user: User) => {
    if (user.isAccountLocked) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Заблокирован</span>;
    }
    if (!user.isEmailVerified || !user.isWhatsAppVerified) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Не верифицирован</span>;
    }
    if (user.hasStudentAccess) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Доступ есть</span>;
    }
    return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Нет доступа</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
          <p className="text-gray-600">Просмотр и управление доступом пользователей к студенческому дашборду</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Всего пользователей</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</div>
            <div className="text-sm text-gray-600">Верифицированных</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.usersWithAccess}</div>
            <div className="text-sm text-gray-600">С доступом к дашборду</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.adminUsers}</div>
            <div className="text-sm text-gray-600">Администраторов</div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
              <input
                type="text"
                placeholder="Email, имя, WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все роли</option>
                <option value="Student">Студент</option>
                <option value="Admin">Администратор</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Доступ</label>
              <select
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все</option>
                <option value="granted">С доступом</option>
                <option value="denied">Без доступа</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => loadUsers(1)}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Загрузка...' : 'Обновить'}
              </button>
            </div>
          </div>
        </div>

        {/* Таблица пользователей */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип ученика</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регистрация</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.whatsappNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Администратор' : 'Студент'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role !== 'admin' ? (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={user.isSchoolStudent}
                            onChange={(e) => updateSchoolStudentStatus(user.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {user.isSchoolStudent ? 'Ученик школы' : 'Внешний'}
                          </span>
                        </label>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAccessModal(true);
                          }}
                          className={`px-3 py-1 rounded text-xs ${
                            user.hasStudentAccess
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.hasStudentAccess ? 'Отозвать доступ' : 'Предоставить доступ'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => loadUsers(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Предыдущая
                </button>
                <button
                  onClick={() => loadUsers(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Следующая
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Показано <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> до{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 20, pagination.totalUsers)}
                    </span>{' '}
                    из <span className="font-medium">{pagination.totalUsers}</span> результатов
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => loadUsers(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || loading}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ←
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {currentPage} из {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => loadUsers(currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Модальное окно управления доступом */}
        {showAccessModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedUser.hasStudentAccess ? 'Отозвать доступ' : 'Предоставить доступ'}
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Пользователь: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Email: <strong>{selectedUser.email}</strong>
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Причина {selectedUser.hasStudentAccess ? 'отзыва' : 'предоставления'} доступа:
                  </label>
                  <textarea
                    value={accessReason}
                    onChange={(e) => setAccessReason(e.target.value)}
                    placeholder="Укажите причину..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAccessModal(false);
                      setSelectedUser(null);
                      setAccessReason('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => updateUserAccess(selectedUser.id, !selectedUser.hasStudentAccess)}
                    className={`px-4 py-2 text-white rounded-md ${
                      selectedUser.hasStudentAccess
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedUser.hasStudentAccess ? 'Отозвать' : 'Предоставить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'admin') {
      return {
        redirect: {
          destination: '/access-denied',
          permanent: false,
        },
      };
    }

    // Загружаем начальные данные
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/users?page=1&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        props: {
          initialUsers: data.users,
          initialStats: data.statistics,
          initialPagination: data.pagination
        },
      };
    }
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
  }

  return {
    redirect: {
      destination: '/auth',
      permanent: false,
    },
  };
};

export default UsersPage;