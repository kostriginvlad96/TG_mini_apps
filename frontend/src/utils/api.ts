import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types';

// Создание экземпляра axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Удаляем токен при ошибке авторизации
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Типизированные методы API
export const api = {
  // Аутентификация
  auth: {
    // Регистрация/авторизация через Telegram
    telegramAuth: async (initData: string) => {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/auth/telegram', { initData });
      return response.data;
    },
    
    // Обновление токена
    refreshToken: async () => {
      const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
      return response.data;
    },
    
    // Выход
    logout: async () => {
      const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
      return response.data;
    },
  },

  // Пользователи
  users: {
    // Получение профиля пользователя
    getProfile: async () => {
      const response = await apiClient.get<ApiResponse<any>>('/users/profile');
      return response.data;
    },
    
    // Обновление профиля
    updateProfile: async (data: any) => {
      const response = await apiClient.put<ApiResponse<any>>('/users/profile', data);
      return response.data;
    },
  },

  // Категории
  categories: {
    // Получение всех категорий
    getAll: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>('/categories');
      return response.data;
    },
    
    // Получение категории по ID
    getById: async (id: number) => {
      const response = await apiClient.get<ApiResponse<any>>(`/categories/${id}`);
      return response.data;
    },
  },

  // Товары
  products: {
    // Получение товаров с пагинацией
    getProducts: async (params?: {
      page?: number;
      limit?: number;
      category?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      const response = await apiClient.get<PaginatedResponse<any>>('/products', { params });
      return response.data;
    },
    
    // Получение товара по ID
    getById: async (id: number) => {
      const response = await apiClient.get<ApiResponse<any>>(`/products/${id}`);
      return response.data;
    },
    
    // Поиск товаров
    search: async (query: string) => {
      const response = await apiClient.get<ApiResponse<any[]>>('/products/search', {
        params: { q: query }
      });
      return response.data;
    },
  },

  // Корзина
  cart: {
    // Получение корзины
    getCart: async () => {
      const response = await apiClient.get<ApiResponse<any>>('/cart');
      return response.data;
    },
    
    // Добавление товара в корзину
    addItem: async (productId: number, quantity: number = 1) => {
      const response = await apiClient.post<ApiResponse<any>>('/cart/items', {
        productId,
        quantity
      });
      return response.data;
    },
    
    // Обновление количества товара
    updateItem: async (itemId: string, quantity: number) => {
      const response = await apiClient.put<ApiResponse<any>>(`/cart/items/${itemId}`, {
        quantity
      });
      return response.data;
    },
    
    // Удаление товара из корзины
    removeItem: async (itemId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/cart/items/${itemId}`);
      return response.data;
    },
    
    // Очистка корзины
    clearCart: async () => {
      const response = await apiClient.delete<ApiResponse<void>>('/cart');
      return response.data;
    },
    
    // Применение промокода
    applyPromoCode: async (promoCode: string) => {
      const response = await apiClient.post<ApiResponse<any>>('/cart/promo', {
        promoCode
      });
      return response.data;
    },
  },

  // Заказы
  orders: {
    // Создание заказа
    createOrder: async (data: {
      items: Array<{ productId: number; quantity: number }>;
      promoCode?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>('/orders', data);
      return response.data;
    },
    
    // Получение заказов пользователя
    getUserOrders: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
    }) => {
      const response = await apiClient.get<PaginatedResponse<any>>('/orders', { params });
      return response.data;
    },
    
    // Получение заказа по ID
    getById: async (id: number) => {
      const response = await apiClient.get<ApiResponse<any>>(`/orders/${id}`);
      return response.data;
    },
    
    // Отмена заказа
    cancelOrder: async (id: number) => {
      const response = await apiClient.post<ApiResponse<void>>(`/orders/${id}/cancel`);
      return response.data;
    },
  },

  // Платежи
  payments: {
    // Создание платежа
    createPayment: async (orderId: number, method: 'telegram' | 'external') => {
      const response = await apiClient.post<ApiResponse<any>>('/payments', {
        orderId,
        method
      });
      return response.data;
    },
    
    // Получение статуса платежа
    getPaymentStatus: async (paymentId: number) => {
      const response = await apiClient.get<ApiResponse<any>>(`/payments/${paymentId}/status`);
      return response.data;
    },
  },

  // Избранное
  favorites: {
    // Получение избранных товаров
    getFavorites: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>('/favorites');
      return response.data;
    },
    
    // Добавление в избранное
    addToFavorites: async (productId: number) => {
      const response = await apiClient.post<ApiResponse<void>>('/favorites', {
        productId
      });
      return response.data;
    },
    
    // Удаление из избранного
    removeFromFavorites: async (productId: number) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/favorites/${productId}`);
      return response.data;
    },
    
    // Проверка, добавлен ли товар в избранное
    isFavorite: async (productId: number) => {
      const response = await apiClient.get<ApiResponse<boolean>>(`/favorites/${productId}/check`);
      return response.data;
    },
  },

  // Поддержка
  support: {
    // Отправка сообщения в поддержку
    sendMessage: async (message: string) => {
      const response = await apiClient.post<ApiResponse<void>>('/support/message', {
        message
      });
      return response.data;
    },
  },

  // FAQ
  faq: {
    // Получение FAQ
    getFAQ: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>('/faq');
      return response.data;
    },
  },

  // Отзывы
  reviews: {
    // Получение отзывов
    getReviews: async (params?: {
      page?: number;
      limit?: number;
    }) => {
      const response = await apiClient.get<PaginatedResponse<any>>('/reviews', { params });
      return response.data;
    },
    
    // Создание отзыва
    createReview: async (data: {
      rating: number;
      comment: string;
      productId?: number;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>('/reviews', data);
      return response.data;
    },
  },
};

// Утилиты для работы с API
export const apiUtils = {
  // Обработка ошибок API
  handleError: (error: any): string => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || 'Произошла ошибка';
  },

  // Проверка успешности ответа
  isSuccess: (response: ApiResponse<any>): boolean => {
    return response.success === true;
  },

  // Получение данных из ответа
  getData: <T>(response: ApiResponse<T>): T | null => {
    return response.data || null;
  },
};

export default apiClient;
