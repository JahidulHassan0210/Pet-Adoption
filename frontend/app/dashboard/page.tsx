"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Heart, Plus, Users, PawPrint, TrendingUp, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { petService, donationService, badgeService } from "@/lib/services"
import { getMediaUrl } from "@/lib/utils"
import type { Pet, Donation, Badge } from "@/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentPets, setRecentPets] = useState<Pet[]>([])
  const [recentDonations, setRecentDonations] = useState<Donation[]>([])
  const [userBadges, setUserBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [petsResponse, donationsResponse, badgesResponse] = await Promise.all([
        petService.getRecent(5),
        donationService.getAll({ limit: 5 }),
        badgeService.getUserBadges(user!.id)
      ])
      
      console.log('Pets response:', petsResponse)
      console.log('Pets response type:', typeof petsResponse, Array.isArray(petsResponse))
      console.log('Donations response:', donationsResponse)
      console.log('Donations response type:', typeof donationsResponse, Array.isArray(donationsResponse))
      console.log('Donations response data:', donationsResponse)
      console.log('Donations response keys:', donationsResponse ? Object.keys(donationsResponse) : 'No response')
      console.log('Badges response:', badgesResponse)
      console.log('Badges response type:', typeof badgesResponse, Array.isArray(badgesResponse))
      
      setRecentPets(Array.isArray(petsResponse) ? petsResponse : [])
      setRecentDonations(Array.isArray(donationsResponse) ? donationsResponse : [])
      setUserBadges(Array.isArray(badgesResponse) ? badgesResponse : [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set empty arrays on error to prevent undefined errors
      setRecentPets([])
      setRecentDonations([])
      setUserBadges([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl text-foreground mb-2">Dashboard</h1>
            <p className="text-xl text-muted-foreground">Welcome back! Here's what's happening in your pet adoption community.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PawPrint className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pets</p>
                    <p className="text-2xl font-bold">{Array.isArray(recentPets) ? recentPets.length : 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Donations</p>
                    <p className="text-2xl font-bold">{Array.isArray(recentDonations) ? recentDonations.length : 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Community</p>
                    <p className="text-2xl font-bold">1,200+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Adoptions</p>
                    <p className="text-2xl font-bold">2,500+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/post-pet">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Post a Pet</h3>
                  <p className="text-muted-foreground text-sm">Share a pet that needs a home or support</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/pets">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-green-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <PawPrint className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Browse Pets</h3>
                  <p className="text-muted-foreground text-sm">Find your perfect companion</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/profile">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-blue-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">My Profile</h3>
                  <p className="text-muted-foreground text-sm">Update your information and preferences</p>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Pets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PawPrint className="h-5 w-5" />
                  <span>Recent Pets</span>
                </CardTitle>
                <CardDescription>Latest pets posted in the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(recentPets) && recentPets.map((pet) => (
                    <div key={pet.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={getMediaUrl(pet.images?.[0]?.image_url)}
                          alt={pet.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{pet.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{pet.pet_species}</p>
                      </div>
                      <BadgeUI variant={pet.type === "adoption" ? "default" : "secondary"}>
                        {pet.type === "adoption" ? "Adoption" : "Donation"}
                      </BadgeUI>
                    </div>
                  ))}
                  {(!Array.isArray(recentPets) || recentPets.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No recent pets</p>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/pets">View All Pets</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Recent Donations</span>
                </CardTitle>
                <CardDescription>Latest contributions to pets in need</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(recentDonations) && recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="text-green-500 font-semibold">${donation.amount}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Donation for {donation.post.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          by {donation.donor.first_name} {donation.donor.last_name}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(recentDonations) || recentDonations.length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-2">No recent donations</p>
                      <p className="text-xs text-muted-foreground">Be the first to make a donation to help pets in need!</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/donations">View All Donations</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          {Array.isArray(userBadges) && userBadges.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Your Badges</span>
                </CardTitle>
                <CardDescription>Recognition for your contributions to the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.isArray(userBadges) && userBadges.map((badge) => (
                    <div key={badge.id} className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
