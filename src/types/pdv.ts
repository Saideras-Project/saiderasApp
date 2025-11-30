export type OrderItem = {
  id: string;
  productId: string;
  name: string; // Joined from Product
  quantity: number;
  unitPrice: number;
  isCourtesy: boolean;
  product: {
    name: string;
  };
};

export type Comanda = {
  id: string;
  table: string;
  status: 'OPEN' | 'CLOSED' | 'PAID';
  total: number;
  tip?: number;
  createdAt: string;
  updatedAt: string;
  waiterId: string;
  items: OrderItem[];
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  unitOfMeasure: string;
  stock?: number; // Optional, depends on context
  minStockLevel?: number;
  category?: string;
  batch?: string;
  expiryDate?: string;
  stockEntries?: {
    quantityCurrent: number;
  }[];
};