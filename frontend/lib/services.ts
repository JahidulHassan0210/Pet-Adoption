import api from './api'
import type {
  User,
  Pet,
  Post,
  Blog,
  Badge,
  Donation,
  Item,
  Comment,
  Bookmark,
  Store,
  Product,
  Order,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/types'

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login/', credentials)
    return response.data
  },

  register: async (userData: FormData): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register/', userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout/')
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile/')
    return response.data
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile/update/', userData)
    return response.data
  },

  changePassword: async (passwordData: { old_password: string; new_password: string }): Promise<{ message: string }> => {
    const response = await api.post('/users/password/change/', passwordData)
    return response.data
  },

  uploadPhoto: async (photoFile: File): Promise<User> => {
    const formData = new FormData()
    formData.append('photo', photoFile)
    
    const response = await api.post('/users/upload-photo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export const petService = {
  getAll: async (params?: {
    page?: number
    limit?: number
    type?: string
    pet_type?: string
    pet_size?: string
    search?: string
  }): Promise<PaginatedResponse<Post>> => {
    const response = await api.get('/posts/', { params })
    // The backend returns { data: [...], total: number, success: boolean }
    return response.data
  },

  getRecent: async (limit: number = 5): Promise<Post[]> => {
    const response = await api.get('/posts/', { params: { limit } })
    // Return just the data array for dashboard
    return response.data.data || []
  },

  getById: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}/`)
    // Handle the nested data structure from the backend
    return response.data.data || response.data
  },

  create: async (petData: FormData): Promise<Post> => {
    const response = await api.post('/posts/create/', petData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data || response.data
  },

  update: async (id: string, petData: Partial<Post>): Promise<Post> => {
    const response = await api.put(`/posts/${id}/update/`, petData)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.post(`/posts/${id}/delete/`)
  },

  getUpdates: async (id: string): Promise<any[]> => {
    const response = await api.get(`/posts/${id}/updates/`)
    return response.data
  },
}

export const commentService = {
  getByPost: async (postId: string): Promise<Comment[]> => {
    const response = await api.get(`/posts/${postId}/comments/`)
    return response.data.data || response.data
  },

  create: async (postId: string, content: string): Promise<Comment> => {
    const response = await api.post(`/posts/${postId}/comment/`, { content })
    return response.data.data || response.data
  },

  delete: async (commentId: string): Promise<void> => {
    await api.delete(`/posts/comments/${commentId}/delete/`)
  },
}

export const bookmarkService = {
  getAll: async (): Promise<Bookmark[]> => {
    const response = await api.get('/posts/bookmarks/')
    return response.data.data || []
  },

  toggle: async (postId: string): Promise<{ is_bookmarked: boolean }> => {
    const response = await api.post(`/posts/${postId}/bookmark/`)
    return response.data
  },

  checkStatus: async (postId: string): Promise<{ is_bookmarked: boolean }> => {
    const response = await api.get(`/posts/${postId}/bookmark-status/`)
    return response.data
  },
}

export const storeService = {
  getAll: async (): Promise<Store[]> => {
    const response = await api.get('/items/stores/')
    return response.data.data || response.data
  },

  create: async (storeData: Partial<Store>): Promise<Store> => {
    const response = await api.post('/items/stores/create/', storeData)
    return response.data.data || response.data
  },

  update: async (storeId: string, storeData: Partial<Store>): Promise<Store> => {
    const response = await api.put(`/items/stores/${storeId}/`, storeData)
    return response.data.data || response.data
  },

  delete: async (storeId: string): Promise<void> => {
    await api.delete(`/items/stores/${storeId}/delete/`)
  },

  getProducts: async (storeId: string): Promise<Product[]> => {
    const response = await api.get(`/items/stores/${storeId}/products/`)
    return response.data.data || response.data
  },
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/items/products/')
    return response.data.data || response.data
  },

  create: async (storeId: string, productData: Partial<Product>): Promise<Product> => {
    const response = await api.post(`/items/stores/${storeId}/products/create/`, productData)
    return response.data.data || response.data
  },

  update: async (productId: string, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/items/products/${productId}/`, productData)
    return response.data.data || response.data
  },

  delete: async (productId: string): Promise<void> => {
    await api.delete(`/items/products/${productId}/delete/`)
  },
}

export const orderService = {
  create: async (storeId: string, orderData: Partial<Order>): Promise<Order> => {
    const response = await api.post(`/items/stores/${storeId}/orders/`, orderData)
    return response.data.data || response.data
  },

  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get('/items/orders/')
    return response.data.data || response.data
  },

  updateStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await api.put(`/items/orders/${orderId}/status/`, { status })
    return response.data.data || response.data
  },
}

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/admin/users/')
    return response.data.data || response.data
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/admin/users/${userId}/`)
  },

  toggleUserStatus: async (userId: string): Promise<User> => {
    const response = await api.put(`/users/admin/users/${userId}/toggle-status/`)
    return response.data.data || response.data
  },

  getAllPosts: async (): Promise<Post[]> => {
    const response = await api.get('/users/admin/posts/')
    return response.data.data || response.data
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/users/admin/posts/${postId}/`)
  },

  getAllComments: async (): Promise<Comment[]> => {
    const response = await api.get('/users/admin/comments/')
    return response.data.data || response.data
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/users/admin/comments/${commentId}/`)
  },
}

export const blogService = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<Blog[]> => {
    const response = await api.get('/blogs/', { params })
    return response.data
  },

  getById: async (id: string): Promise<Blog> => {
    const response = await api.get(`/blogs/${id}/`)
    return response.data
  },

  create: async (blogData: FormData): Promise<Blog> => {
    const response = await api.post('/blogs/create/', blogData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  update: async (id: string, blogData: Partial<Blog>): Promise<Blog> => {
    const response = await api.put(`/blogs/${id}/update/`, blogData)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.post(`/blogs/${id}/delete/`)
  },
}

export const badgeService = {
  getAll: async (): Promise<Badge[]> => {
    const response = await api.get('/badges/')
    return response.data.data || response.data
  },

  getById: async (id: string): Promise<Badge> => {
    const response = await api.get(`/badges/${id}/`)
    return response.data.data || response.data
  },

  getUserBadges: async (userId: string): Promise<Badge[]> => {
    const response = await api.get(`/badges/user/${userId}/`)
    return response.data.data || response.data
  },

  getCurrentUserBadges: async (): Promise<Badge[]> => {
    const response = await api.get('/badges/user/')
    return response.data.data || response.data
  },

  getUserStats: async (): Promise<any> => {
    const response = await api.get('/badges/stats/')
    return response.data.data || response.data
  },
}

export const donationService = {
  getAll: async (params?: {
    page?: number
    limit?: number
    post_id?: string
  }): Promise<Donation[]> => {
    const response = await api.get('/donations/', { params })
    return response.data.data || response.data
  },

  create: async (donationData: {
    amount: number
    message?: string
    post_id: string
    payment_method: string
    reference_id: string
  }): Promise<Donation> => {
    const response = await api.post('/donations/create/', donationData)
    return response.data.data || response.data
  },

  getByPost: async (postId: string): Promise<Donation[]> => {
    const response = await api.get(`/donations/post/${postId}/`)
    return response.data.data || response.data
  },

  getUserDonations: async (): Promise<Donation[]> => {
    const response = await api.get('/donations/user/')
    return response.data.data || response.data
  },

  verify: async (donationId: string): Promise<Donation> => {
    const response = await api.post(`/donations/${donationId}/verify/`)
    return response.data.data || response.data
  },

  // Admin functions
  getPendingManual: async (): Promise<Donation[]> => {
    const response = await api.get('/donations/admin/pending/')
    return response.data.data || response.data
  },

  reviewManual: async (donationId: string, action: 'approve' | 'reject', adminNotes?: string): Promise<Donation> => {
    const response = await api.put(`/donations/${donationId}/review/`, {
      action,
      admin_notes: adminNotes
    })
    return response.data.data || response.data
  },
}

export const postService = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<Post>> => {
    const response = await api.get('/posts/', { params })
    // Handle the nested data structure from the backend
    return response.data.data || response.data
  },

  getById: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}/`)
    // Handle the nested data structure from the backend
    return response.data.data || response.data
  },

  create: async (postData: Partial<Post>): Promise<Post> => {
    const response = await api.post('/posts/create/', postData)
    return response.data
  },

  update: async (id: string, postData: Partial<Post>): Promise<Post> => {
    const response = await api.put(`/posts/${id}/update/`, postData)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.post(`/posts/${id}/delete/`)
  },

  getUpdates: async (id: string): Promise<any[]> => {
    const response = await api.get(`/posts/${id}/updates/`)
    return response.data
  },
}

export const itemService = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    min_price?: number
    max_price?: number
  }): Promise<Item[]> => {
    const response = await api.get('/items/list/', { params })
    return response.data.data || response.data
  },

  getById: async (id: string): Promise<Item> => {
    const response = await api.get(`/items/${id}/`)
    return response.data.data || response.data
  },

  create: async (itemData: Partial<Item>): Promise<Item> => {
    const response = await api.post('/items/', itemData)
    return response.data.data || response.data
  },

  claim: async (id: string): Promise<Item> => {
    const response = await api.put(`/items/${id}/claim/`)
    return response.data.data || response.data
  },
}
