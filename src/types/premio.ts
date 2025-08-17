export interface Premio {
  id: number;
  nombre: string;
  descripcion?: string | null;
  costo_fitcoins: number;
  stock: number;
  is_active: boolean;
  image_path?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
