// Telegram Web App типы
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: TelegramChat;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    getItems: (keys: string[]) => Promise<{ [key: string]: string | null }>;
    removeItem: (key: string) => Promise<void>;
    removeItems: (keys: string[]) => Promise<void>;
    getKeys: () => Promise<string[]>;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  isVersionAtLeast: (version: string) => boolean;
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }> }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (data: string | null) => void) => void;
  requestWriteAccess: (callback?: (access: boolean) => void) => void;
  requestContact: (callback?: (contact: { phone_number: string; first_name: string; last_name?: string; user_id?: number; vcard?: string }) => void) => void;
  invokeCustomMethod: (method: string, params?: any, callback?: (result: any) => void) => void;
  invokeCustomMethodAsync: (method: string, params?: any) => Promise<any>;
  isClosingConfirmationEnabled: boolean;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  isSettingsButtonVisible: boolean;
  showSettingsButton: () => void;
  hideSettingsButton: () => void;
  isMainButtonVisible: boolean;
  showMainButton: () => void;
  hideMainButton: () => void;
  isBackButtonVisible: boolean;
  showBackButton: () => void;
  hideBackButton: () => void;
  isHapticFeedbackEnabled: boolean;
  enableHapticFeedback: () => void;
  disableHapticFeedback: () => void;
  isClosingConfirmationEnabled: boolean;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  isSettingsButtonVisible: boolean;
  showSettingsButton: () => void;
  hideSettingsButton: () => void;
  isMainButtonVisible: boolean;
  showMainButton: () => void;
  hideMainButton: () => void;
  isBackButtonVisible: boolean;
  showBackButton: () => void;
  hideBackButton: () => void;
  isHapticFeedbackEnabled: boolean;
  enableHapticFeedback: () => void;
  disableHapticFeedback: () => void;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

// Пользователь приложения
export interface User {
  id: number;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Категории товаров
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Товары
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: number;
  category: Category;
  imageUrl: string;
  images: string[];
  type: 'game' | 'subscription' | 'donation';
  platform?: 'ps4' | 'ps5' | 'pc' | 'xbox' | 'nintendo';
  region?: string;
  isDigital: boolean;
  isActive: boolean;
  stock: number;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Корзина
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount: number;
  finalTotal: number;
  promoCode?: string;
}

// Заказы
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  createdAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  user: User;
  items: OrderItem[];
  total: number;
  discount: number;
  finalTotal: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'telegram' | 'external';
  paymentStatus: 'pending' | 'paid' | 'failed';
  promoCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Платежи
export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  method: 'telegram' | 'external';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// API ответы
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Состояние приложения
export interface AppState {
  user: User | null;
  cart: Cart;
  isLoading: boolean;
  error: string | null;
}

// Навигация
export type Route = '/' | '/catalog' | '/product/:id' | '/cart' | '/profile' | '/favorites' | '/faq' | '/reviews' | '/loading';

// Фильтры для каталога
export interface CatalogFilters {
  category?: number;
  priceRange?: [number, number];
  platform?: string;
  type?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
