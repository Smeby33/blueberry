// Types pour les catégories
export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  id: string;
  name: string;
  description?: string;
  order: number;
  visible: boolean;
}

// Types pour les services
export interface CategoriesService {
  getCategories(): Promise<Category[]>;
  getVisibleCategories(): Promise<Category[]>;
  getCategoryById(categoryId: string): Promise<Category | null>;
  addCategory(categoryData: CategoryFormData): Promise<string>;
  updateCategory(categoryId: string, categoryData: Partial<CategoryFormData>): Promise<void>;
  deleteCategory(categoryId: string): Promise<void>;
  getCategoryItemCount(categoryId: string): Promise<number>;
}
