
// This is the Supabase database schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          surname: string;
          block_number: number;
          unit_number: number;
          mobile_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          surname: string;
          block_number: number;
          unit_number: number;
          mobile_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          surname?: string;
          block_number?: number;
          unit_number?: number;
          mobile_number?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          image_url: string;
          flavours?: string[];
          available: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          image_url: string;
          flavours?: string[];
          available: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          image_url?: string;
          flavours?: string[];
          available?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_date: string;
          delivery_date: string;
          status: 'pending' | 'approved' | 'rejected' | 'completed';
          total: number;
          is_special_order: boolean;
          special_instructions?: string;
          payment_method?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_date: string;
          delivery_date: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          total: number;
          is_special_order: boolean;
          special_instructions?: string;
          payment_method?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_date?: string;
          delivery_date?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          total?: number;
          is_special_order?: boolean;
          special_instructions?: string;
          payment_method?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          flavor?: string;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          flavor?: string;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          flavor?: string;
          price?: number;
        };
      };
      contact_forms: {
        Row: {
          id: string;
          name: string;
          company?: string;
          email: string;
          mobile_number: string;
          message: string;
          type: 'query' | 'partnership';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string;
          email: string;
          mobile_number: string;
          message: string;
          type: 'query' | 'partnership';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string;
          email?: string;
          mobile_number?: string;
          message?: string;
          type?: 'query' | 'partnership';
          created_at?: string;
        };
      };
    };
  };
};
