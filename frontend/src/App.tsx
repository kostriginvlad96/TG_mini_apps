import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from '@/context/AppContext';
import LoadingScreen from '@/components/LoadingScreen';
import HomePage from '@/pages/HomePage';
import CartPage from '@/pages/CartPage';
import ProfilePage from '@/pages/ProfilePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductPage from '@/pages/ProductPage';

// Создание экземпляра QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Экран загрузки */}
              <Route path="/loading" element={<LoadingScreen />} />
              
              {/* Главная страница */}
              <Route path="/" element={<HomePage />} />
              
              {/* Каталог */}
              <Route path="/catalog" element={<CatalogPage />} />
              
              {/* Детальная страница товара */}
              <Route path="/product/:id" element={<ProductPage />} />
              
              {/* Корзина */}
              <Route path="/cart" element={<CartPage />} />
              
              {/* Личный кабинет */}
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Заглушки для остальных страниц */}
              <Route path="/favorites" element={<div className="min-h-screen bg-secondary-dark flex items-center justify-center"><div className="text-white text-lg">Избранное (в разработке)</div></div>} />
              <Route path="/faq" element={<div className="min-h-screen bg-secondary-dark flex items-center justify-center"><div className="text-white text-lg">FAQ (в разработке)</div></div>} />
              <Route path="/reviews" element={<div className="min-h-screen bg-secondary-dark flex items-center justify-center"><div className="text-white text-lg">Отзывы (в разработке)</div></div>} />
              <Route path="/orders" element={<div className="min-h-screen bg-secondary-dark flex items-center justify-center"><div className="text-white text-lg">Мои покупки (в разработке)</div></div>} />
              <Route path="/support" element={<div className="min-h-screen bg-secondary-dark flex items-center justify-center"><div className="text-white text-lg">Поддержка (в разработке)</div></div>} />
              
              {/* Перенаправление на главную для неизвестных маршрутов */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
