
export type UserType = {
  id: string;
  name: string;
  surname: string;
  blockNumber: number;
  unitNumber: number;
  mobileNumber: string;
  createdAt: string;
  isAdmin?: boolean;
};

export type ProductType = {
  id: string;
  name: string;
  price: number;
  flavours?: string[];
  image_url?: string;
};

export type OrderType = {
  id: string;
  userId: string;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  items: OrderItemType[];
  total: number;
  isSpecialOrder: boolean;
  specialInstructions?: string;
};

export type OrderItemType = {
  productId: string;
  productName: string;
  quantity: number;
  flavor?: string;
  price: number;
};

export type ContactFormType = {
  name: string;
  company?: string;
  email: string;
  mobileNumber: string;
  message: string;
  type: 'query' | 'partnership';
};
