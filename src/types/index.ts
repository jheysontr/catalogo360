export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  store_id: string;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  owner_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}
