import React from 'react';

const CartPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Корзина</h1>
        <p className="text-gray-300">Корзина пуста</p>
      </div>
    </div>
  );
};

export default CartPage;
