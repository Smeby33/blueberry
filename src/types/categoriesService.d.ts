import { Category } from '../types/categories';

declare module '../services/categoriesService' {
  export function addCategory(categoryData: any): Promise<Category>;
  export function getCategories(): Promise<Category[]>;
  export function getCategoryById(categoryId: string): Promise<Category | null>;
  export function updateCategory(categoryId: string, categoryData: any): Promise<Category>;
  export function deleteCategory(categoryId: string): Promise<boolean>;
  export function toggleCategoryVisibility(categoryId: string, visible: boolean): Promise<boolean>;
  export function getCategoriesCount(): Promise<number>;
}
