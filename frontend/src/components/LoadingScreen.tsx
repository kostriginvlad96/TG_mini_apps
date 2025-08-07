import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Имитация загрузки - в реальном приложении здесь будет проверка инициализации
    const timer = setTimeout(() => {
      setIsVisible(false);
      navigate('/');
    }, 3000); // Показываем экран загрузки 3 секунды

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Фоновые декоративные элементы */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-10 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent opacity-10 rounded-full translate-y-32 -translate-x-32"></div>
      
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Логотип с бабушкой */}
        <div className="relative">
          <div className="w-24 h-24 bg-error rounded-full flex items-center justify-center relative">
            {/* Иконка бабушки */}
            <div className="text-white text-4xl">👵</div>
          </div>
        </div>

        {/* Название приложения */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            БАБКИН ВНУК
          </h1>
        </div>

        {/* Слоган */}
        <div className="bg-primary text-secondary-dark px-8 py-4 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-lg font-medium">
              С любовью и заботой,
            </p>
            <p className="text-lg font-medium">
              как у бабушки!
            </p>
          </div>
        </div>

        {/* Индикатор загрузки */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Футер */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-400 text-sm">
          P.S. Лучший магазин цифровых товаров=)
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
