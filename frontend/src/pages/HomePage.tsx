import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { api } from '@/utils/api';
import { hapticFeedback } from '@/utils/telegram';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [psPlusDuration, setPsPlusDuration] = useState<'1' | '3' | '12'>('1');
  const [products, setProducts] = useState<{
    bestSellers: Product[];
    newArrivals: Product[];
    psPlusSubscriptions: Product[];
    eaPlaySubscriptions: Product[];
    donations: Product[];
  }>({
    bestSellers: [],
    newArrivals: [],
    psPlusSubscriptions: [],
    eaPlaySubscriptions: [],
    donations: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // Загрузка товаров по категориям
      const [bestSellers, newArrivals, psPlus, eaPlay, donations] = await Promise.all([
        api.products.getProducts({ category: 1, limit: 10, sortBy: 'sales' }),
        api.products.getProducts({ category: 2, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
        api.products.getProducts({ category: 3, limit: 10 }),
        api.products.getProducts({ category: 4, limit: 10 }),
        api.products.getProducts({ category: 5, limit: 10 }),
      ]);

      setProducts({
        bestSellers: bestSellers.data || [],
        newArrivals: newArrivals.data || [],
        psPlusSubscriptions: psPlus.data || [],
        eaPlaySubscriptions: eaPlay.data || [],
        donations: donations.data || [],
      });
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const searchResults = await api.products.search(query);
        // TODO: Показать результаты поиска
      } catch (error) {
        console.error('Ошибка поиска:', error);
      }
    }
  };

  const handleScroll = (direction: 'left' | 'right', containerId: string) => {
    hapticFeedback.light();
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 300;
      const currentScroll = container.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const renderProductSection = (
    title: string,
    products: Product[],
    containerId: string,
    variant: 'default' | 'subscription' | 'donation' = 'default',
    showNewTag = false
  ) => (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {showNewTag && (
            <span className="bg-primary text-secondary-dark text-xs px-2 py-1 rounded font-bold">
              NEW
            </span>
          )}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <button
          onClick={() => handleScroll('right', containerId)}
          className="p-2 bg-primary text-secondary-dark rounded-full hover:bg-primary-dark transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="relative">
        <div
          id={containerId}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0" style={{ width: '280px' }}>
              <ProductCard product={product} variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderSubscriptionSection = (
    title: string,
    products: Product[],
    duration: '1' | '3' | '12',
    onDurationChange: (duration: '1' | '3' | '12') => void
  ) => (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">
        {title}
      </h2>
      
      {/* Переключатель длительности */}
      <div className="flex mb-4 bg-secondary-light rounded-lg p-1">
        {[
          { value: '1' as const, label: '1 месяц' },
          { value: '3' as const, label: '3 месяца' },
          { value: '12' as const, label: '12 месяцев' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onDurationChange(value)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              duration === value
                ? 'bg-primary text-secondary-dark'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Карточки подписок */}
      <div className="space-y-3">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            variant="subscription" 
          />
        ))}
      </div>
    </section>
  );

  const renderDonationSection = (products: Product[]) => (
    <section className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🐷</span>
        <h2 className="text-xl font-bold text-white">Игровой донат</h2>
      </div>
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0" style={{ width: '200px' }}>
              <ProductCard product={product} variant="donation" />
            </div>
          ))}
        </div>
        
        {products.length > 3 && (
          <button
            onClick={() => handleScroll('right', 'donations-container')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-secondary-dark rounded-full hover:bg-primary-dark transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-dark flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-dark">
      <Header showSearch onSearchChange={handleSearch} searchValue={searchQuery} />
      
      <main className="px-4 py-6">
        {/* Подписки PS PLUS */}
        {renderSubscriptionSection(
          'Подписки PS PLUS',
          products.psPlusSubscriptions,
          psPlusDuration,
          setPsPlusDuration
        )}

        {/* Подписки EA PLAY */}
        {renderSubscriptionSection(
          'Подписки EA PLAY',
          products.eaPlaySubscriptions,
          '1',
          () => {}
        )}

        {/* Игровой донат */}
        {renderDonationSection(products.donations)}

        {/* Лидеры продаж */}
        {renderProductSection('ЛИДЕРЫ ПРОДАЖ', products.bestSellers, 'bestsellers-container')}

        {/* Новинки */}
        {renderProductSection('НОВИНКИ', products.newArrivals, 'newarrivals-container', 'default', true)}
      </main>
    </div>
  );
};

export default HomePage;
