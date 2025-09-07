"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Search, Calendar, Filter, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { petService, bookmarkService } from "@/lib/services"
import { useAuth } from "@/hooks/use-auth"
import type { Pet } from "@/types"

export default function PetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPetType, setSelectedPetType] = useState("all")
  const [selectedSize, setSelectedSize] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [pets, setPets] = useState<Pet[]>([])
  const [bookmarkedPets, setBookmarkedPets] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    fetchPets()
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  const fetchPets = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      
      if (searchQuery) params.search = searchQuery
      if (selectedType !== "all") params.type = selectedType
      if (selectedPetType !== "all") params.pet_type = selectedPetType
      if (selectedSize !== "all") params.pet_size = selectedSize
      
      const response = await petService.getAll(params)
      setPets(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch pets")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const response = await bookmarkService.getAll()
      const bookmarkedIds = new Set<string>(response?.map((bookmark: { post: string }) => bookmark.post) || [])
      setBookmarkedPets(bookmarkedIds)
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
      setBookmarkedPets(new Set())
    }
  }

  const handleBookmark = async (petId: string) => {
    if (!user) {
      alert("Please login to bookmark pets")
      return
    }

    try {
      const response = await bookmarkService.toggle(petId)
      if (response.is_bookmarked) {
        setBookmarkedPets(prev => new Set([...prev, petId]))
      } else {
        setBookmarkedPets(prev => {
          const newSet = new Set(prev)
          newSet.delete(petId)
          return newSet
        })
      }
    } catch (err) {
      alert("Failed to bookmark pet")
    }
  }

  const handleSearch = () => {
    fetchPets()
  }

  const filteredPets = pets?.filter((pet) => {
    const matchesTab = activeTab === "all" || pet.type === activeTab
    return matchesTab
  }) || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchPets}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Find Pets" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="font-heading font-bold text-4xl text-foreground">Find Your Perfect Companion</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse through adorable pets waiting for their forever homes or support pets in need
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, breed, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-11"
              />
            </div>
            <Button variant="outline" onClick={handleSearch} className="md:w-auto bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={selectedPetType} onValueChange={setSelectedPetType}>
              <SelectTrigger>
                <SelectValue placeholder="Pet Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Dog">Dogs</SelectItem>
                <SelectItem value="Cat">Cats</SelectItem>
                <SelectItem value="Bird">Birds</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Post Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="adoption">Adoption</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedType("all")
                setSelectedPetType("all")
                setSelectedSize("all")
                fetchPets()
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                      <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="all">All Pets ({pets?.length || 0})</TabsTrigger>
              <TabsTrigger value="adoption">
                Adoption ({pets?.filter((p) => p.type === "adoption").length || 0})
              </TabsTrigger>
              <TabsTrigger value="donation">
                Donations ({pets?.filter((p) => p.type === "donation").length || 0})
              </TabsTrigger>
            </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {filteredPets?.length || 0} of {pets?.length || 0} pets
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets?.map((pet) => (
                <Card
                  key={pet.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={pet.images?.[0]?.image_url ? `http://localhost:8000/media/${pet.images[0].image_url}` : "/sample.png"}
                      alt={pet.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading font-bold text-xl mb-1">{pet.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {pet.pet_species && pet.pet_age ? `${pet.pet_species} • ${pet.pet_age} years old` : pet.pet_species || (pet.pet_age ? `${pet.pet_age} years old` : '')}
                        </p>
                      </div>
                      <Badge variant={pet.type === "adoption" ? "default" : "secondary"}>
                        {pet.type === "adoption" ? "Adoption" : "Donation"}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{pet.description}</p>

                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{pet.created_at ? formatDate(pet.created_at) : 'Date unknown'}</span>
                    </div>

                    {pet.type === "donation" && pet.donation_goal && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Raised</span>
                          <span className="font-semibold">
                            ${parseFloat(pet.current_amount?.toString() || '0')} / ${parseFloat(pet.donation_goal?.toString() || '0')}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${calculateProgress(parseFloat(pet.current_amount?.toString() || '0'), parseFloat(pet.donation_goal?.toString() || '0'))}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button asChild className="flex-1">
                        <Link href={`/pets/${pet.id}`}>{pet.type === "adoption" ? "Learn More" : "Donate Now"}</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleBookmark(pet.id)}
                        className={bookmarkedPets?.has(pet.id) ? "text-red-500 border-red-500" : ""}
                      >
                        <Heart className={`h-4 w-4 ${bookmarkedPets?.has(pet.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!filteredPets || filteredPets.length === 0) && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">No pets found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedType("all")
                    setSelectedPetType("all")
                    setSelectedSize("all")
                    fetchPets()
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
