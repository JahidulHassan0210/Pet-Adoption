"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { authService } from '@/lib/services'
import type { User, LoginRequest } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  register: (userData: FormData) => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const userData = await authService.getProfile()
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          console.error('Auth init error:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)
      localStorage.setItem('access_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('Logout error (ignored):', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const register = async (userData: FormData) => {
    try {
      const response = await authService.register(userData)
      localStorage.setItem('access_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData)
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
