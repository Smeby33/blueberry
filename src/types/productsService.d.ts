import { Product, ProductFormData } from '../types/products';

declare module '../services/productsService' {
  export function addProduct(productData: ProductFormData): Promise<Product>;
  export function getProducts(): Promise<Product[]>;
  export function getProductsByCategory(categoryId: string): Promise<Product[]>;
  export function getAvailableProducts(): Promise<Product[]>;
  export function getSpecialProducts(): Promise<Product[]>;
  export function getProductById(productId: string): Promise<Product | null>;
  export function updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<Product>;
  export function deleteProduct(productId: string): Promise<boolean>;
  export function toggleProductAvailability(productId: string, available: boolean): Promise<boolean>;
  export function toggleProductSpecial(productId: string, isSpecial: boolean): Promise<boolean>;
  export function getProductsCount(): Promise<number>;
  export function searchProducts(searchTerm: string): Promise<Product[]>;
}
