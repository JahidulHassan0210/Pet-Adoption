    "use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface NavigationProps {
  showHomeLink?: boolean
  currentPage?: string
}

export default function Navigation({ showHomeLink = true, currentPage }: NavigationProps) {
  const { user, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="font-heading font-bold text-2xl text-foreground">PawsConnect</span>
            </Link>
            {currentPage && (
              <div className="hidden md:flex items-center space-x-2 text-muted-foreground">
                <span className="text-foreground">{currentPage}</span>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pets" className="text-foreground hover:text-primary transition-colors">
              Find Pets
            </Link>
            <Link href="/store" className="text-foreground hover:text-primary transition-colors">
              Store
            </Link>
            <Link href="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/badges" className="text-foreground hover:text-primary transition-colors">
              Badges
            </Link>
            {user?.is_staff && (
              <>
              <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
                Admin
              </Link>
              <Link href="/admin/manual-payments" className="text-foreground hover:text-primary transition-colors">
                Manual Payments
              </Link>
              </>
              )}
             
          </div>

          <div className="flex items-center space-x-4">
            {!isLoading && user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </span>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : !isLoading ? (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
