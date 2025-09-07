export interface User {
  id: string
  username: string
  first_name?: string
  last_name?: string
  email: string
  nid_photo?: string
  profile_photo?: string
  location?: string
  bio?: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user: User
  type: 'adoption' | 'donation'
  title: string
  description?: string
  pet_type?: string
  pet_age?: number
  pet_size?: 'small' | 'medium' | 'large'
  pet_species?: string
  donation_goal?: number
  current_amount: number
  status: 'active' | 'completed' | 'cancelled'
  donations_enabled: boolean
  created_at: string
  updated_at: string
  images?: PostImage[]
}

export interface PostImage {
  id: string
  post: Post
  image_url: string
  caption?: string
  uploaded_at: string
}

export interface PostUpdate {
  id: string
  post: string
  user: User
  update_text?: string
  new_images?: string[]
  update_type: 'text' | 'image' | 'both'
  created_at: string
}

export interface Comment {
  id: string
  post: string
  user: User
  content: string
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user: User
  post: string
  created_at: string
}

export interface Blog {
  id: string
  title: string
  content?: string
  author: User
  image?: string
  tags?: string[]
  published_at: string
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  criteria: string
  category: 'adoption' | 'donation' | 'community' | 'volunteer'
  points_required: number
  created_at: string
}

export interface UserBadge {
  id: string
  user: User
  badge: Badge
  assigned_at: string
}

export interface UserContribution {
  id: string
  user: User
  contribution_type: 'adoption' | 'donation' | 'item_donation' | 'blog_post' | 'volunteer'
  contribution_id: string
  points_earned: number
  description?: string
  created_at: string
}

export interface Donation {
  id: string
  post: Post
  donor: User
  amount: number | string
  payment_method: string
  reference_id: string
  message?: string
  status: 'pending' | 'verified' | 'rejected'
  verified_by?: User
  verified_at?: string
  created_at: string
}

export interface Item {
  id: string
  post: Post
  donor: User
  item_type: 'food' | 'toy'
  item_name: string
  description?: string
  quantity: number
  image?: string
  status: 'available' | 'claimed'
  is_claimed: boolean
  claimed_by?: User
  claimed_at?: string
  created_at: string
}

export interface Store {
  id: string
  name: string
  description?: string
  owner: User
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store: Store
  name: string
  description?: string
  category: 'food' | 'toy' | 'accessory'
  price: number | string
  stock_quantity: string
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user: User
  store: Store
  products: Product[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address?: string
  payment_method?: string
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  message: string
}

export interface RegisterRequest {
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  nid_photo: File
}

export interface RegisterResponse {
  message: string
  user: User
  token: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export type Pet = Post
