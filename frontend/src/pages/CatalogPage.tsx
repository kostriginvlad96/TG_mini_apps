import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, ChevronDown } from 'lucide-react';
import { api } from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

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
}

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Получение категорий
  const { data: categoriesData } = useQuery('categories', () =>
    api.get('/products/categories').then(res => res.data)
  );

  // Получение товаров с фильтрацией
  const { data: productsData, isLoading, refetch } = useQuery(
    ['products', searchQuery, selectedCategory, sortBy, sortOrder],
    () => api.get('/products', {
      params: {
        search: searchQuery,
        category_id: selectedCategory,
        sort: sortBy,
        order: sortOrder,
        limit: 50
      }
    }).then(res => res.data),
    {
      keepPreviousData: true
    }
  );

  const categories = categoriesData?.categories || [];
  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  // Обработка поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Очистка фильтров
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('name');
    setSortOrder('ASC');
    refetch();
  };

  // Переход к товару
  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-secondary-dark">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Каталог товаров</h1>
          <p className="text-gray-300">Найдите нужные вам игры и подписки</p>
        </div>

        {/* Поиск и фильтры */}
        <div className="bg-primary-dark rounded-lg p-4 mb-6">
          {/* Поиск */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск игр или подписок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-dark border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </form>

          {/* Фильтры */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Кнопка фильтров */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Фильтры
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Сортировка */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'ASC' | 'DESC');
              }}
              className="px-4 py-2 bg-secondary-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="name-ASC">По названию (А-Я)</option>
              <option value="name-DESC">По названию (Я-А)</option>
              <option value="price-ASC">По цене (дешевле)</option>
              <option value="price-DESC">По цене (дороже)</option>
            </select>

            {/* Режим отображения */}
            <div className="flex bg-secondary-dark rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Очистить фильтры */}
            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Очистить
              </button>
            )}
          </div>

          {/* Расширенные фильтры */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Категории */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Категория
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Все категории</option>
                    {categories.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Результаты */}
        <div className="mb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-300 mt-4">Загрузка товаров...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-300">
                  Найдено товаров: {pagination?.total || products.length}
                </p>
              </div>

              {/* Сетка товаров */}
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Пагинация */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`px-3 py-2 rounded-lg ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'bg-secondary-dark text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Товары не найдены
              </h3>
              <p className="text-gray-300 mb-6">
                Попробуйте изменить параметры поиска или фильтры
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Очистить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
