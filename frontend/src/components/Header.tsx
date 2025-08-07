import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, ShoppingCart, User, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { hapticFeedback } from '@/utils/telegram';

interface HeaderProps {
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showSearch = false, 
  onSearchChange, 
  searchValue = '' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();

  const handleMenuClick = () => {
    hapticFeedback.light();
    navigate('/catalog');
  };

  const handleLogoClick = () => {
    hapticFeedback.light();
    navigate('/');
  };

  const handleCartClick = () => {
    hapticFeedback.light();
    navigate('/cart');
  };

  const handleProfileClick = () => {
    hapticFeedback.light();
    navigate('/profile');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  const cartItemsCount = state.cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-secondary-dark text-white relative overflow-hidden">
      {/* Фоновые декоративные элементы */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute top-4 right-8 w-8 h-8 bg-primary opacity-30 rounded-full"></div>
      
      <div className="relative z-10 px-4 py-3">
        {/* Статус бар */}
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-gray-300">9:30</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Основная навигация */}
        <div className="flex items-center justify-between">
          {/* Левая кнопка - меню/каталог */}
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-full bg-primary text-secondary-dark hover:bg-primary-dark transition-colors"
            aria-label="Открыть каталог"
          >
            <Menu size={20} />
          </button>

          {/* Логотип/название приложения */}
          <button
            onClick={handleLogoClick}
            className="text-xl font-bold text-primary hover:text-primary-dark transition-colors"
          >
            БАБКИН ВНУК
          </button>

          {/* Правые кнопки */}
          <div className="flex items-center space-x-2">
            {/* Корзина */}
            <button
              onClick={handleCartClick}
              className="relative p-2 rounded-full bg-primary text-secondary-dark hover:bg-primary-dark transition-colors"
              aria-label="Корзина"
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Профиль пользователя */}
            <button
              onClick={handleProfileClick}
              className="p-2 rounded-full bg-primary text-secondary-dark hover:bg-primary-dark transition-colors"
              aria-label="Личный кабинет"
            >
              <User size={20} />
            </button>
          </div>
        </div>

        {/* Поисковая строка */}
        {showSearch && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Найти игру или подписку"
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-white text-secondary-dark rounded-lg border-2 border-primary focus:border-primary-dark focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Быстрые действия (только на главной странице) */}
        {location.pathname === '/' && (
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => {
                hapticFeedback.light();
                navigate('/favorites');
              }}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-secondary-light hover:bg-secondary transition-colors"
            >
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary-dark text-sm">♥</span>
              </div>
              <span className="text-xs text-gray-300">Избранное</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback.light();
                navigate('/faq');
              }}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-secondary-light hover:bg-secondary transition-colors"
            >
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary-dark text-sm">?</span>
              </div>
              <span className="text-xs text-gray-300">FAQ</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback.light();
                navigate('/reviews');
              }}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-secondary-light hover:bg-secondary transition-colors"
            >
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-secondary-dark text-sm">👍</span>
              </div>
              <span className="text-xs text-gray-300">Отзывы</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
