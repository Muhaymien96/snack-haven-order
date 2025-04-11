import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type Product = {
  id: string;
  name: string;
  price: number;
  type: string;
  flavours: string[];
  image_url?: string;
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    type: '',
    flavours: [],
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      toast.error('Failed to fetch products');
    } else {
      setProducts(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'flavours' ? value.split(',') : value }));
  };

  const handleSubmit = async () => {
    if (editingProduct) {
      const { error } = await supabase.from('products').update(formData).eq('id', editingProduct.id);
      if (error) return toast.error('Failed to update product');
      toast.success('Product updated');
    } else {
      const { error } = await supabase.from('products').insert(formData);
      if (error) return toast.error('Failed to add product');
      toast.success('Product added');
    }
    setEditingProduct(null);
    setFormData({ name: '', price: 0, type: '', flavours: [], image_url: '' });
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      type: product.type,
      flavours: product.flavours || [],
      image_url: product.image_url || ''
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return toast.error('Failed to delete product');
    toast.success('Product deleted');
    fetchProducts();
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Product Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <Input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} />
        <Input name="type" placeholder="Type" value={formData.type} onChange={handleChange} />
        <Input name="flavours" placeholder="Flavours (comma separated)" value={formData.flavours.join(',')} onChange={handleChange} />
        <Input name="image_url" placeholder="Image URL" value={formData.image_url || ''} onChange={handleChange} />
      </div>

      <Button onClick={handleSubmit} className="bg-terracotta">
        {editingProduct ? 'Update Product' : 'Add Product'}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded-md shadow-sm bg-white">
            <h4 className="font-bold">{product.name}</h4>
            <p className="text-sm text-muted-foreground">R{product.price.toFixed(2)}</p>
            <p className="text-sm">Type: {product.type}</p>
            <p className="text-sm">Flavours: {product.flavours?.join(', ')}</p>
            {product.image_url && <img src={product.image_url} alt={product.name} className="mt-2 h-24 object-cover rounded" />}
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;
