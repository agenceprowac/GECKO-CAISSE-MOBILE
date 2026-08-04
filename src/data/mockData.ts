import type { Category, Product, Table, User } from '../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Bières', color: 'bg-accent-beer', icon: 'Beer' },
  { id: '2', name: 'Cocktails', color: 'bg-accent-cocktail', icon: 'Martini' },
  { id: '3', name: 'Vins', color: 'bg-accent-wine', icon: 'Wine' },
  { id: '4', name: 'Softs', color: 'bg-accent-soft', icon: 'CupSoda' },
  { id: '5', name: 'Snacks', color: 'bg-accent-snack', icon: 'Pizza' },
];

export const mockProducts: Product[] = [
  { id: '1', categoryId: '1', name: 'Heineken Pression 25cl', price: 2000, stock: 50 },
  { id: '2', categoryId: '1', name: 'Heineken Pression 50cl', price: 3500, stock: 50 },
  { id: '3', categoryId: '1', name: 'Guinness Bouteille', price: 2500, stock: 24 },
  { id: '4', categoryId: '2', name: 'Mojito', price: 5000, stock: 100 },
  { id: '5', categoryId: '2', name: 'Pina Colada', price: 5500, stock: 100 },
  { id: '6', categoryId: '3', name: 'Verre Vin Rouge', price: 3000, stock: 30 },
  { id: '7', categoryId: '3', name: 'Bouteille Rosé', price: 15000, stock: 10 },
  { id: '8', categoryId: '4', name: 'Coca-Cola', price: 1500, stock: 48 },
  { id: '9', categoryId: '4', name: 'Jus d\'Orange', price: 2000, stock: 24 },
  { id: '10', categoryId: '5', name: 'Planche Mixte', price: 10000, stock: 10 },
  { id: '11', categoryId: '5', name: 'Frites', price: 2500, stock: 40 },
];

export const mockTables: Table[] = [
  { id: 't1', name: 'Table 1' },
  { id: 't2', name: 'Table 2' },
  { id: 't3', name: 'Table 3' },
  { id: 't4', name: 'Comptoir' },
  { id: 't5', name: 'Ardoise VIP' },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Lionel VITHIANO', pinCode: '1234', role: 'ADMIN' },
  { id: 'u2', name: 'Kouassi Jean', pinCode: '2580', role: 'WAITER' },
  { id: 'u3', name: 'Awa Diallo', pinCode: '0000', role: 'BARMAN' },
];
