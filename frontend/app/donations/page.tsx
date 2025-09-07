"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, TrendingUp, Calendar, User, MessageSquare, Gift, Plus } from "lucide-react"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"
import { donationService } from "@/lib/services"
import VolunteerDonationForm from "@/components/volunteer-donation-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMediaUrl } from "@/lib/utils"
import type { Donation } from "@/types"

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [showVolunteerForm, setShowVolunteerForm] = useState(false)

  useEffect(() => {
    fetchDonations()
  }, [])

  useEffect(() => {
    filterAndSortDonations()
  }, [donations, searchTerm, statusFilter, sortBy])

  const fetchDonations = async () => {
    try {
      setIsLoading(true)
      const response = await donationService.getAll({ limit: 100 })
      setDonations(response || [])
    } catch (error) {
      console.error('Failed to fetch donations:', error)
      setDonations([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortDonations = () => {
    let filtered = [...donations]

    if (searchTerm) {
      filtered = filtered.filter(donation => 
        donation.post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.message?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(donation => donation.status === statusFilter)
    }

    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "amount-high":
        filtered.sort((a, b) => b.amount - a.amount)
        break
      case "amount-low":
        filtered.sort((a, b) => a.amount - b.amount)
        break
    }

    setFilteredDonations(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading donations...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Donations" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl text-foreground mb-2">Donations</h1>
            <p className="text-xl text-muted-foreground">
              View all contributions to pets in need and track community generosity
            </p>
          </div>

          <Tabs defaultValue="monetary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monetary" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monetary Donations
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Item Donations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="monetary" className="mt-6">
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search donations by pet name, donor, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredDonations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No donations found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filters"
                      : "There are no donations to display at the moment"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDonations.map((donation) => (
                <Card key={donation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">
                            ${Number(donation.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg truncate">
                            Donation for {donation.post.title}
                          </h3>
                          <Badge className={getStatusColor(donation.status)}>
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>
                              {donation.donor.first_name} {donation.donor.last_name}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(donation.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="capitalize">{donation.payment_method}</span>
                          </div>
                        </div>
                        
                        {donation.message && (
                          <div className="mt-3 flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground italic">
                              "{donation.message}"
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Reference ID</p>
                          <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {donation.reference_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

              {filteredDonations.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground">
                    Showing {filteredDonations.length} of {donations.length} donations
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="items" className="mt-6">
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Donate Pet Items</h3>
                    <p className="text-muted-foreground">
                      Donate food, toys, and accessories. Our volunteers will collect from your location.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowVolunteerForm(!showVolunteerForm)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {showVolunteerForm ? 'Hide Form' : 'Donate Items'}
                  </Button>
                </div>
              </div>

              {showVolunteerForm ? (
                <VolunteerDonationForm 
                  onSuccess={() => setShowVolunteerForm(false)}
                  onCancel={() => setShowVolunteerForm(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowVolunteerForm(true)}>
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Gift className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Donate Pet Items</h3>
                      <p className="text-muted-foreground text-sm">
                        Food, toys, accessories, and more
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🚚</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Free Pickup</h4>
                          <p className="text-sm text-muted-foreground">We collect from your location</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Our volunteers will arrange a convenient time to collect your donations directly from your home or office.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">❤️</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Direct Impact</h4>
                          <p className="text-sm text-muted-foreground">Help pets immediately</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your donated items go directly to pets in need, providing immediate care and comfort.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
