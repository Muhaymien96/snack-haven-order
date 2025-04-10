import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// These are public keys - safe to expose in client-side code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (
  name: string,
  surname: string,
  blockNumber: number,
  unitNumber: number,
  mobileNumber: string,
  password: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email: `${mobileNumber}@user.snackhaven.co.za`, // Using mobile as unique identifier
    password,
    options: {
      data: {
        name,
        surname,
        block_number: blockNumber,
        unit_number: unitNumber,
        mobile_number: mobileNumber,
      },
    },
  });
  
  return { data, error };
};

export const signIn = async (mobileNumber: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${mobileNumber}@user.snackhaven.co.za`,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// Database helper functions for various tables
export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*');
  return { data, error };
};

export const createOrder = async (orderData: {
  user_id: string;
  delivery_date: string;
  is_special_order: boolean;
  special_instructions?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    flavor?: string;
    price: number;
  }>;
  total: number;
}) => {
  try {
    // Insert the main order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        order_date: new Date().toISOString(),
        delivery_date: orderData.delivery_date,
        status: 'pending',
        total: orderData.total,
        is_special_order: orderData.is_special_order,
        special_instructions: orderData.special_instructions,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error inserting order:", orderError);
      return { data: null, error: orderError };
    }

    // Prepare order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      flavor: item.flavor,
      price: item.price,
    }));

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("Error inserting order items:", itemsError);
      return { data: null, error: itemsError };
    }

    return { data: order, error: null };
  } catch (e: any) {
    console.error("Unexpected error:", e);
    return { data: null, error: { message: e.message } };
  }
};


export const submitContactForm = async (formData: {
  name: string;
  company?: string;
  email: string;
  mobile_number: string;
  message: string;
  type: 'query' | 'partnership';
}) => {
  const { data, error } = await supabase
    .from('contact_forms')
    .insert({
      name: formData.name,
      company: formData.company,
      email: formData.email,
      mobile_number: formData.mobile_number,
      message: formData.message,
      type: formData.type,
      created_at: new Date().toISOString(),
    })
    .select();

  return { data, error };
};
