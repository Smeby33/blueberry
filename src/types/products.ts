export interface Product {
  id?: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  available: boolean;
  isSpecial: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  available: boolean;
  isSpecial: boolean;
}

export interface ProductsService {
  addProduct: (productData: ProductFormData) => Promise<Product>;
  getProducts: () => Promise<Product[]>;
  getProductsByCategory: (categoryId: string) => Promise<Product[]>;
  getAvailableProducts: () => Promise<Product[]>;
  getSpecialProducts: () => Promise<Product[]>;
  getProductById: (productId: string) => Promise<Product | null>;
  updateProduct: (productId: string, productData: Partial<ProductFormData>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<boolean>;
  toggleProductAvailability: (productId: string, available: boolean) => Promise<boolean>;
  toggleProductSpecial: (productId: string, isSpecial: boolean) => Promise<boolean>;
  getProductsCount: () => Promise<number>;
  searchProducts: (searchTerm: string) => Promise<Product[]>;
}
