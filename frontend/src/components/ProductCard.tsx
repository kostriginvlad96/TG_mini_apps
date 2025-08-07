import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { hapticFeedback } from '@/utils/telegram';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'subscription' | 'donation';
  showFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default',
  showFavorite = true 
}) => {
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const handleCardClick = () => {
    hapticFeedback.light();
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.medium();
    addToCart(product, 1);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.light();
    // TODO: Добавить логику избранного
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const renderSubscriptionCard = () => (
    <div 
      className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center space-x-4">
        {/* Иконка платформы */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          variant === 'subscription' ? 'bg-primary' : 'bg-purple-600'
        }`}>
          <span className="text-white font-bold text-sm">
            {product.platform?.toUpperCase() || 'PS'}
          </span>
        </div>

        {/* Информация о товаре */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-secondary-dark">
                {formatPrice(product.price)} ₽
              </p>
              <p className="text-sm text-gray-600">
                {product.name}
              </p>
            </div>
            
            {/* Кнопка добавления в корзину */}
            <button
              onClick={handleAddToCart}
              className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              aria-label="Добавить в корзину"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDonationCard = () => (
    <div 
      className="bg-purple-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="text-center">
        {/* Логотип игры */}
        <div className="mb-2">
          <p className="text-white font-bold text-sm">{product.name}</p>
        </div>
        
        {/* Тип доната */}
        <div className="mb-3">
          <p className="text-white text-lg font-bold">POINTS</p>
        </div>
        
        {/* Иконки валюты */}
        <div className="flex justify-center space-x-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-4 h-4 bg-green-500 transform rotate-45"></div>
          ))}
        </div>
        
        {/* Цена */}
        <div className="mt-3">
          <p className="text-white font-bold">
            {formatPrice(product.price)} ₽
          </p>
        </div>
      </div>
    </div>
  );

  const renderDefaultCard = () => (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Изображение товара */}
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Нет+изображения';
          }}
        />
        
        {/* Скидка */}
        {getDiscountPercentage() > 0 && (
          <div className="absolute top-2 left-2 bg-error text-white text-xs px-2 py-1 rounded">
            -{getDiscountPercentage()}%
          </div>
        )}
        
        {/* Кнопка избранного */}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-opacity"
            aria-label="Добавить в избранное"
          >
            <Heart size={16} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Информация о товаре */}
      <div className="p-4">
        <h3 className="font-semibold text-secondary-dark mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-secondary-dark">
                  {formatPrice(product.price)} ₽
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)} ₽
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-secondary-dark">
                {formatPrice(product.price)} ₽
              </span>
            )}
          </div>
          
          {/* Кнопка добавления в корзину */}
          <button
            onClick={handleAddToCart}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            aria-label="Добавить в корзину"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* Платформа */}
        {product.platform && (
          <div className="mt-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.platform.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Выбор типа отображения карточки
  switch (variant) {
    case 'subscription':
      return renderSubscriptionCard();
    case 'donation':
      return renderDonationCard();
    default:
      return renderDefaultCard();
  }
};

export default ProductCard;
