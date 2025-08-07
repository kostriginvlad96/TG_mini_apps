import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Cart, AppState } from '@/types';
import { api } from '@/utils/api';
import { initTelegramWebApp, getTelegramUser } from '@/utils/telegram';

// Типы действий
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'ADD_TO_CART'; payload: any }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'INITIALIZE_APP' };

// Начальное состояние
const initialState: AppState = {
  user: null,
  cart: {
    items: [],
    total: 0,
    discount: 0,
    finalTotal: 0,
  },
  isLoading: true,
  error: null,
};

// Редьюсер
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CART':
      return { ...state, cart: action.payload };
    
    case 'ADD_TO_CART': {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.cart.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const updatedItems = state.cart.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
          ...state,
          cart: {
            ...state.cart,
            items: updatedItems,
            total,
            finalTotal: total - state.cart.discount,
          },
        };
      } else {
        const newItem = {
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          price: product.price,
        };
        const updatedItems = [...state.cart.items, newItem];
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
          ...state,
          cart: {
            ...state.cart,
            items: updatedItems,
            total,
            finalTotal: total - state.cart.discount,
          },
        };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const updatedItems = state.cart.items.filter(item => item.id !== action.payload);
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          total,
          finalTotal: total - state.cart.discount,
        },
      };
    }
    
    case 'UPDATE_CART_ITEM': {
      const { id, quantity } = action.payload;
      const updatedItems = state.cart.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          total,
          finalTotal: total - state.cart.discount,
        },
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        cart: {
          items: [],
          total: 0,
          discount: 0,
          finalTotal: 0,
        },
      };
    
    case 'INITIALIZE_APP':
      return { ...state, isLoading: false };
    
    default:
      return state;
  }
}

// Контекст
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Действия
  login: (user: User) => void;
  logout: () => void;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Провайдер
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Инициализация приложения
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Инициализация Telegram Web App
        const webApp = initTelegramWebApp();
        if (!webApp) {
          throw new Error('Telegram Web App не найден');
        }

        // Получение данных пользователя из Telegram
        const telegramUser = getTelegramUser();
        if (!telegramUser) {
          throw new Error('Пользователь не авторизован в Telegram');
        }

        // Авторизация через API
        const authResponse = await api.auth.telegramAuth(webApp.initData);
        if (authResponse.success && authResponse.data) {
          const { token, user } = authResponse.data;
          localStorage.setItem('auth_token', token);
          dispatch({ type: 'SET_USER', payload: user });
          
          // Загрузка корзины
          try {
            const cartResponse = await api.cart.getCart();
            if (cartResponse.success && cartResponse.data) {
              dispatch({ type: 'SET_CART', payload: cartResponse.data });
            }
          } catch (error) {
            console.warn('Не удалось загрузить корзину:', error);
          }
        } else {
          throw new Error(authResponse.error || 'Ошибка авторизации');
        }
      } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Неизвестная ошибка' });
      } finally {
        dispatch({ type: 'INITIALIZE_APP' });
      }
    };

    initializeApp();
  }, []);

  // Действия
  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  const addToCart = async (product: any, quantity: number = 1) => {
    try {
      const response = await api.cart.addItem(product.id, quantity);
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Не удалось добавить товар в корзину' });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await api.cart.removeItem(itemId);
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Не удалось удалить товар из корзины' });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const response = await api.cart.updateItem(itemId, quantity);
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error) {
      console.error('Ошибка обновления корзины:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Не удалось обновить корзину' });
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.cart.clearCart();
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Не удалось очистить корзину' });
    }
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const value: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setError,
    setLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Хук для использования контекста
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp должен использоваться внутри AppProvider');
  }
  return context;
};

// Алиас для обратной совместимости
export const useAppContext = useApp;
