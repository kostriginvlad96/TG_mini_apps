import React, { useState } from 'react';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { hapticFeedback } from '@/utils/telegram';

const CartPage: React.FC = () => {
  const { state, removeFromCart, updateCartItem } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    hapticFeedback.light();
    updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    hapticFeedback.medium();
    removeFromCart(itemId);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    try {
      // TODO: Применить промокод через API
      hapticFeedback.success();
    } catch (error) {
      hapticFeedback.error();
      console.error('Ошибка применения промокода:', error);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const calculateTotal = () => {
    return state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateFinalTotal = () => {
    const total = calculateTotal();
    return total - state.cart.discount;
  };

  // Если корзина пуста
  if (state.cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-dark">
        <Header />
        <main className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Корзина</h1>
            <span className="text-white">{formatPrice(0)}₽</span>
          </div>
          
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">
              В корзине пусто
            </div>
            <p className="text-gray-400 text-sm">
              Добавьте товары из каталога, чтобы начать покупки
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-dark">
      <Header />
      <main className="px-4 py-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Корзина</h1>
          <span className="text-white">{formatPrice(calculateFinalTotal())}₽</span>
        </div>

        {/* Список товаров */}
        <div className="bg-white rounded-lg p-4 mb-6">
          {state.cart.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
              {/* Изображение товара */}
              <div className="flex-shrink-0">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/64x64?text=Нет+изображения';
                  }}
                />
              </div>

              {/* Информация о товаре */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-secondary-dark text-sm line-clamp-2">
                  {item.product.name}
                </h3>
                <p className="text-gray-500 text-xs">
                  {item.product.platform?.toUpperCase()}
                </p>
              </div>

              {/* Управление количеством */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={16} className="text-gray-600" />
                </button>
                
                <span className="text-secondary-dark font-medium min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Цена */}
              <div className="text-right">
                <p className="font-semibold text-secondary-dark">
                  {formatPrice(item.price * item.quantity)} ₽
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-500">
                    {formatPrice(item.price)} ₽ за шт.
                  </p>
                )}
              </div>

              {/* Кнопка удаления */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-2 text-gray-400 hover:text-error transition-colors"
                aria-label="Удалить товар"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Промокод */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Введите промокод"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleApplyPromoCode}
              disabled={!promoCode.trim() || isApplyingPromo}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingPromo ? 'Применяется...' : 'Применить'}
            </button>
          </div>
        </div>

        {/* Итого */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Товары ({state.cart.items.length})</span>
              <span className="text-secondary-dark">{formatPrice(calculateTotal())} ₽</span>
            </div>
            
            {state.cart.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Скидка</span>
                <span>-{formatPrice(state.cart.discount)} ₽</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-secondary-dark">Итого</span>
                <span className="font-bold text-secondary-dark text-lg">
                  {formatPrice(calculateFinalTotal())} ₽
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка оформления заказа */}
        <button
          onClick={() => {
            hapticFeedback.medium();
            // TODO: Переход к оформлению заказа
          }}
          className="w-full bg-primary text-secondary-dark py-4 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
        >
          <span>Оформить заказ</span>
          <ArrowRight size={20} />
        </button>
      </main>
    </div>
  );
};

export default CartPage;
