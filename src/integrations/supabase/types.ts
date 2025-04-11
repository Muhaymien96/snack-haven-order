export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | null;
          type: 'regular' | 'bulk' | 'custom' | null;
          user_id: string | null;
          order_date: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          status?: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | null;
          type?: 'regular' | 'bulk' | 'custom' | null;
          user_id?: string | null;
          order_date?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          status?: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | null;
          type?: 'regular' | 'bulk' | 'custom' | null;
          user_id?: string | null;
          order_date?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string | null;
          quantity: number | null;
          flavor: string | null;
          price: number | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name?: string | null;
          quantity?: number | null;
          flavor?: string | null;
          price?: number | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string | null;
          quantity?: number | null;
          flavor?: string | null;
          price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };

      products: {
        Row: {
          id: string;
          name: string | null;
          price: number | null;
          type: string | null;
          flavours: string[] | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          price?: number | null;
          type?: string | null;
          flavours?: string[] | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          price?: number | null;
          type?: string | null;
          flavours?: string[] | null;
          image_url?: string | null;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          name: string | null;
          surname: string | null;
          mobile: string | null;
          block_number: number | null;
          unit_number: number | null;
          role: 'admin' | 'user' | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          surname?: string | null;
          mobile?: string | null;
          block_number?: number | null;
          unit_number?: number | null;
          role?: 'admin' | 'user' | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          surname?: string | null;
          mobile?: string | null;
          block_number?: number | null;
          unit_number?: number | null;
          role?: 'admin' | 'user' | null;
        };
        Relationships: [];
      };

      partnership_requests: {
        Row: {
          id: string;
          business_name: string | null;
          contact_name: string | null;
          created_at: string | null;
          message: string | null;
          mobile: string | null;
        };
        Insert: {
          id?: string;
          business_name?: string | null;
          contact_name?: string | null;
          created_at?: string | null;
          message?: string | null;
          mobile?: string | null;
        };
        Update: {
          id?: string;
          business_name?: string | null;
          contact_name?: string | null;
          created_at?: string | null;
          message?: string | null;
          mobile?: string | null;
        };
        Relationships: [];
      };

      contact_forms: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      order_status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
      order_type: 'regular' | 'bulk' | 'custom';
      user_role: 'admin' | 'user';
    };
    CompositeTypes: {};
  };
};
