
import { ProductType } from '@/types';

export const products: ProductType[] = [
  {
    id: '1',
    name: 'Bollas',
    description: 'Traditional sweet dough balls, deep-fried and coated with your choice of toppings. A perfect bite-sized South African treat.',
    price: 6.00, // Updated price
    image: './src/assets/coconut.jpg',
    category: 'sweets',
    flavors: ['Glazed', 'Coconut', 'Syrup'],
    available: true
  },
  {
    id: '2',
    name: 'Koeksisters',
    description: 'Plaited pastries, deep-fried and soaked in sweet syrup. These sticky delights are a South African favorite.',
    price: 6.00, // Updated price
    image: './src/assets/koeksister.webp',
    category: 'sweets',
    flavors: ['Coconut', 'Syrup'],
    available: true
  },
  {
    id: '3',
    name: 'Chicken Samoosas',
    description: 'Crispy triangular pastries filled with spiced chicken filling. Perfect as a savory snack or appetizer.',
    price: 5.00, // Updated price
    image: './src/assets/mince.png',
    category: 'savory',
    available: true
  },
  {
    id: '4',
    name: 'Mince Samoosas',
    description: 'Crispy triangular pastries filled with spiced minced meat. A popular South African savory treat.',
    price: 5.00, // Updated price
    image: './src/assets/Chicken-Samosa.png',
    category: 'savory',
    available: true
  }
];
