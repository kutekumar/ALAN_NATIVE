import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  orderType: 'Dine In' | 'Take Away';
}

interface CartContextType {
  cart: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: 'Dine In' | 'Take Away') => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartState>({
    items: [],
    restaurantId: null,
    orderType: 'Dine In',
  });

  const addItem = (item: CartItem) => {
    setCart(prevCart => {
      // Check if adding from a different restaurant
      if (prevCart.restaurantId && prevCart.restaurantId !== item.restaurantId) {
        Alert.alert(
          'Different Restaurant',
          'You can only order from one restaurant at a time. Clear your current cart to add items from this restaurant.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear Cart',
              style: 'destructive',
              onPress: () => {
                setCart({
                  items: [{ ...item, quantity: 1 }],
                  restaurantId: item.restaurantId,
                  orderType: prevCart.orderType,
                });
              },
            },
          ]
        );
        return prevCart;
      }

      // Find existing item
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => cartItem.menuId === item.menuId
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex].quantity += item.quantity || 1;
        
        return {
          ...prevCart,
          items: updatedItems,
          restaurantId: item.restaurantId,
        };
      } else {
        // Add new item
        return {
          ...prevCart,
          items: [...prevCart.items, { ...item, quantity: item.quantity || 1 }],
          restaurantId: item.restaurantId,
        };
      }
    });
  };

  const removeItem = (menuId: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.menuId !== menuId);
      
      return {
        ...prevCart,
        items: updatedItems,
        restaurantId: updatedItems.length > 0 ? prevCart.restaurantId : null,
      };
    });
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuId);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.menuId === menuId ? { ...item, quantity } : item
      );

      return {
        ...prevCart,
        items: updatedItems,
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      restaurantId: null,
      orderType: 'Dine In',
    });
  };

  const setOrderType = (type: 'Dine In' | 'Take Away') => {
    setCart(prevCart => ({
      ...prevCart,
      orderType: type,
    }));
  };

  const getTotalPrice = (): number => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = (): number => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const contextValue: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setOrderType,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};