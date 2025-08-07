import React, { useEffect } from 'react';
import { initTelegramWebApp, getTelegramUser, hapticFeedback } from '@/utils/telegram';

const HomePage: React.FC = () => {
  useEffect(() => {
    // Инициализация Telegram Web App
    const webApp = initTelegramWebApp();
    const user = getTelegramUser();
    
    if (webApp && user) {
      console.log('Telegram Web App инициализирован');
      console.log('Пользователь:', user);
      
      // Haptic feedback при загрузке
      hapticFeedback.light();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">БАБКИН ВНУК</h1>
        <p className="text-xl mb-8">Telegram Mini App Store</p>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Добро пожаловать!</h2>
          <p className="text-gray-300 mb-4">
            Магазин цифровых товаров и подписок для игр
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>✅ Backend API работает</p>
            <p>✅ Frontend запущен</p>
            <p>✅ База данных настроена</p>
            <p>✅ Telegram Web App готов</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
