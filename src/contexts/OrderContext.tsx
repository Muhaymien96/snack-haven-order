
import React, { createContext, useContext, useState } from 'react';

type OrderContextType = {
  isSpecialOrder: boolean;
  setIsSpecialOrder: (value: boolean) => void;
  deliveryDate: string | null;
  setDeliveryDate: (date: string | null) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSpecialOrder, setIsSpecialOrder] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);

  return (
    <OrderContext.Provider
      value={{
        isSpecialOrder,
        setIsSpecialOrder,
        deliveryDate,
        setDeliveryDate,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
