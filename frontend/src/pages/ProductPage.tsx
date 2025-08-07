import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, ShoppingCart, Heart, Star, Share2, Minus, Plus } from 'lucide-react';
import { api } from '@/utils/api';
import { useAppContext } from '@/context/AppContext';
import Header from '@/components/Header';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  image_url: string;
  stock_quantity: number;
  category_name: string;
  category_slug: string;
  is_digital: boolean;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cart } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Получение данных о товаре
  const { data: productData, isLoading, error } = useQuery(
    ['product', id],
    () => api.get(`/products/${id}`).then(res => res.data),
    {
      enabled: !!id
    }
  );

  const product = productData?.product;

  // Проверка наличия товара в корзине
  const cartItem = cart.find(item => item.id === product?.id);
  const currentQuantity = cartItem?.quantity || 0;

  // Обработка изменения количества
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product?.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  // Добавление в корзину
  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity: quantity
      });
    }
  };

  // Переход назад
  const handleBack = () => {
    navigate(-1);
  };

  // Поделиться
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href
      });
    } else {
      // Fallback для браузеров без поддержки Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-dark">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-700 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="h-12 bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-secondary-dark">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-white mb-2">Товар не найден</h2>
            <p className="text-gray-300 mb-6">Запрашиваемый товар не существует или был удален</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discount = product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-secondary-dark">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Навигация */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Изображение товара */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.image_url || '/images/placeholder-product.png'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg bg-gray-700"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-product.png';
                }}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{discount}%
                </div>
              )}
              {product.stock_quantity === 0 && (
                <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                  Нет в наличии
                </div>
              )}
            </div>

            {/* Действия */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'В избранном' : 'В избранное'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Поделиться
              </button>
            </div>
          </div>

          {/* Информация о товаре */}
          <div className="space-y-6">
            {/* Категория */}
            <div className="text-sm text-blue-400">
              {product.category_name}
            </div>

            {/* Название */}
            <h1 className="text-3xl font-bold text-white">
              {product.name}
            </h1>

            {/* Рейтинг */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-300 text-sm">4.5 (128 отзывов)</span>
            </div>

            {/* Цена */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">
                  {product.price.toLocaleString()} ₽
                </span>
                {product.original_price > product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.original_price.toLocaleString()} ₽
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-green-400 text-sm font-semibold">
                  Экономия {discount}%
                </span>
              )}
            </div>

            {/* Описание */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Описание</h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Наличие */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-300">
                {product.stock_quantity > 0 
                  ? `В наличии: ${product.stock_quantity} шт.`
                  : 'Нет в наличии'
                }
              </span>
            </div>

            {/* Количество */}
            {product.stock_quantity > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Количество
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-600 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-white min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-gray-300 text-sm">
                    Доступно: {product.stock_quantity}
                  </span>
                </div>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="space-y-4">
              {product.stock_quantity > 0 ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItem ? `В корзине (${currentQuantity})` : 'Добавить в корзину'}
                  </button>
                  {cartItem && (
                    <button
                      onClick={() => navigate('/cart')}
                      className="w-full py-3 border border-blue-600 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Перейти в корзину
                    </button>
                  )}
                </>
              ) : (
                <button
                  disabled
                  className="w-full py-4 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                >
                  Товар недоступен
                </button>
              )}
            </div>

            {/* Дополнительная информация */}
            <div className="border-t border-gray-600 pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Тип товара:</span>
                <span className="text-white">
                  {product.is_digital ? 'Цифровой' : 'Физический'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Доставка:</span>
                <span className="text-white">Мгновенная</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Гарантия:</span>
                <span className="text-white">30 дней</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
