import { TelegramWebApp, TelegramUser } from '@/types';

// Глобальная переменная для Telegram Web App
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

// Получение экземпляра Telegram Web App
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

// Инициализация Telegram Web App
export const initTelegramWebApp = (): TelegramWebApp | null => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
    
    // Настройка темы
    if (webApp.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    return webApp;
  }
  return null;
};

// Получение данных пользователя
export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

// Проверка авторизации
export const isTelegramAuthorized = (): boolean => {
  const webApp = getTelegramWebApp();
  return !!(webApp?.initDataUnsafe?.user);
};

// Показ главной кнопки
export const showMainButton = (text: string, callback?: () => void): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.setText(text);
    if (callback) {
      webApp.MainButton.onClick(callback);
    }
    webApp.MainButton.show();
    webApp.MainButton.enable();
  }
};

// Скрытие главной кнопки
export const hideMainButton = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.hide();
  }
};

// Показ кнопки "Назад"
export const showBackButton = (callback?: () => void): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    if (callback) {
      webApp.BackButton.onClick(callback);
    }
    webApp.BackButton.show();
  }
};

// Скрытие кнопки "Назад"
export const hideBackButton = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.hide();
  }
};

// Тактильная обратная связь
export const hapticFeedback = {
  light: () => {
    const webApp = getTelegramWebApp();
    webApp?.HapticFeedback.impactOccurred('light');
  },
  medium: () => {
    const webApp = getTelegramWebApp();
    webApp?.HapticFeedback.impactOccurred('medium');
  },
  heavy: () => {
    const webApp = getTelegramWebApp();
    webApp?.HapticFeedback.impactOccurred('heavy');
  },
  success: () => {
    const webApp = getTelegramWebApp();
    webApp?.HapticFeedback.notificationOccurred('success');
  },
  error: () => {
    const webApp = getTelegramWebApp();
    webApp?.HapticFeedback.notificationOccurred('error');
  },
  warning: () => {
    const webApp = getTelegramWebApp();
    webApp?.HapticFeedback.notificationOccurred('warning');
  },
  selection: () => {
    const webApp = getTelegramWebApp();
    webApp?.HapticFeedback.selectionChanged();
  },
};

// Показ алерта
export const showAlert = (message: string, callback?: () => void): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showAlert(message, callback);
  }
};

// Показ подтверждения
export const showConfirm = (message: string, callback?: (confirmed: boolean) => void): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showConfirm(message, callback);
  }
};

// Показ попапа
export const showPopup = (
  params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }> },
  callback?: (buttonId: string) => void
): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showPopup(params, callback);
  }
};

// Открытие ссылки
export const openLink = (url: string, options?: { try_instant_view?: boolean }): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.openLink(url, options);
  }
};

// Открытие счета
export const openInvoice = (url: string, callback?: (status: string) => void): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.openInvoice(url, callback);
  }
};

// Закрытие приложения
export const closeApp = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.close();
  }
};

// Получение данных из облачного хранилища
export const getCloudStorageItem = async (key: string): Promise<string | null> => {
  const webApp = getTelegramWebApp();
  if (webApp?.CloudStorage) {
    return await webApp.CloudStorage.getItem(key);
  }
  return null;
};

// Сохранение данных в облачное хранилище
export const setCloudStorageItem = async (key: string, value: string): Promise<void> => {
  const webApp = getTelegramWebApp();
  if (webApp?.CloudStorage) {
    await webApp.CloudStorage.setItem(key, value);
  }
};

// Удаление данных из облачного хранилища
export const removeCloudStorageItem = async (key: string): Promise<void> => {
  const webApp = getTelegramWebApp();
  if (webApp?.CloudStorage) {
    await webApp.CloudStorage.removeItem(key);
  }
};

// Проверка версии Telegram Web App
export const isVersionAtLeast = (version: string): boolean => {
  const webApp = getTelegramWebApp();
  return webApp?.isVersionAtLeast(version) || false;
};

// Получение параметров темы
export const getThemeParams = () => {
  const webApp = getTelegramWebApp();
  return webApp?.themeParams || {};
};

// Получение высоты viewport
export const getViewportHeight = (): number => {
  const webApp = getTelegramWebApp();
  return webApp?.viewportHeight || window.innerHeight;
};

// Получение стабильной высоты viewport
export const getViewportStableHeight = (): number => {
  const webApp = getTelegramWebApp();
  return webApp?.viewportStableHeight || window.innerHeight;
};
