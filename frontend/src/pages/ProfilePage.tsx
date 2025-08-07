import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, HeadphonesIcon, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { hapticFeedback } from '@/utils/telegram';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();

  const handleMenuClick = (path: string) => {
    hapticFeedback.light();
    navigate(path);
  };

  const menuItems = [
    {
      id: 'favorites',
      icon: Heart,
      title: 'Избранное',
      path: '/favorites',
      color: 'text-red-500',
    },
    {
      id: 'orders',
      icon: ShoppingBag,
      title: 'Мои покупки',
      path: '/orders',
      color: 'text-blue-500',
    },
    {
      id: 'support',
      icon: HeadphonesIcon,
      title: 'Обратиться в поддержку',
      path: '/support',
      color: 'text-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-dark">
      <Header />
      <main className="px-4 py-6">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Личный кабинет
          </h1>
          <p className="text-gray-300">
            {state.user?.firstName} {state.user?.lastName}
          </p>
        </div>

        {/* Меню */}
        <div className="bg-white rounded-lg overflow-hidden">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full bg-gray-100 ${item.color}`}>
                    <IconComponent size={20} />
                  </div>
                  <span className="text-secondary-dark font-medium">
                    {item.title}
                  </span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            );
          })}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-6 bg-white rounded-lg p-4">
          <h3 className="text-secondary-dark font-semibold mb-3">
            Информация о пользователе
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Имя:</span>
              <span className="text-secondary-dark">
                {state.user?.firstName} {state.user?.lastName}
              </span>
            </div>
            {state.user?.username && (
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="text-secondary-dark">@{state.user.username}</span>
              </div>
            )}
            {state.user?.isPremium && (
              <div className="flex justify-between">
                <span className="text-gray-600">Статус:</span>
                <span className="text-primary font-medium">Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {state.cart.items.length}
            </div>
            <div className="text-sm text-gray-600">
              Товаров в корзине
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              0
            </div>
            <div className="text-sm text-gray-600">
              Заказов
            </div>
          </div>
        </div>

        {/* Кнопка выхода */}
        <div className="mt-6">
          <button
            onClick={() => {
              hapticFeedback.medium();
              // TODO: Добавить логику выхода
            }}
            className="w-full bg-error text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Выйти из аккаунта
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
