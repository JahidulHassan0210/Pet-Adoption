"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Heart, MapPin, Calendar, Share2, ArrowLeft, DollarSign, Upload, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { petService } from "@/lib/services"
import { useAuth } from "@/hooks/use-auth"
import type { Pet } from "@/types"
import DonationForm from "@/components/donation-form"
import CommentSection from "@/components/comment-section"

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [pet, setPet] = useState<Pet | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchPet(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (pet && pet.images && pet.images.length > 0) {
      setSelectedImage(0)
    } else {
      setSelectedImage(0)
    }
  }, [pet])

  const fetchPet = async (id: string) => {
    try {
      setIsLoading(true)
      const petData = await petService.getById(id)
      console.log("Fetched pet data:", petData)
      
      if (petData && petData.id) {
        setPet(petData)
      } else {
        setError("Invalid pet data format")
      }
    } catch (err: any) {
      setError("Failed to fetch pet details")
      console.error("Error fetching pet:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Loading..." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading pet details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Pet Not Found" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-destructive">{error || "Pet not found"}</p>
            <Button onClick={() => router.push("/pets")} className="mt-4">Back to Pets</Button>
          </div>
        </div>
      </div>
    )
  }

  console.log("Rendering pet:", pet)

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={pet.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/pets">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pets
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={pet.images && pet.images.length > 0 && selectedImage < pet.images.length 
                                  ? `http://localhost:8000/media/${pet.images[selectedImage]?.image_url}` || "/sample.png"
                : "/sample.png"}
                alt={pet.title}
                className="w-full h-full object-cover"
              />
            </div>
            {pet.images && pet.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {pet.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <img
                      src={`http://localhost:8000/media/${image.image_url}`}
                      alt={image.caption || `${pet.title} image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pet Information */}
          <div className="space-y-6">
            <div>
              <CardTitle className="font-heading text-3xl mb-2">{pet.title || "Untitled Pet"}</CardTitle>
              <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                <span>
                  {pet.pet_species || "Unknown breed"} • {pet.pet_age || "Unknown"} years old • {pet.pet_size || "Unknown size"}
                </span>
              </div>
              <Badge variant={pet.type === "adoption" ? "default" : "secondary"} className="text-sm px-3 py-1">
                {pet.type === "adoption" ? "Available for Adoption" : "Needs Donations"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{pet.user?.location || "Location not specified"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Posted {pet.created_at ? formatDate(pet.created_at) : "Date unknown"}</span>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-xl mb-3">About {pet.title || "this pet"}</h3>
              <p className="text-muted-foreground leading-relaxed">{pet.description || "No description available."}</p>
            </div>

            {/* Donation Progress */}
            {pet.type === "donation" && pet.donation_goal && (
              <div className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Donation Progress</span>
                  <span className="text-sm text-muted-foreground">
                    ${parseFloat(pet.current_amount?.toString() || '0')} of ${parseFloat(pet.donation_goal?.toString() || '0')}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(parseFloat(pet.current_amount?.toString() || '0'), parseFloat(pet.donation_goal?.toString() || '0'))}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {Math.round(calculateProgress(parseFloat(pet.current_amount?.toString() || '0'), parseFloat(pet.donation_goal?.toString() || '0')))}% funded
                </div>
              </div>
            )}

            {/* Pet Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Type</div>
                <div className="font-semibold">{pet.pet_type || "Unknown"}</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Breed</div>
                <div className="font-semibold">{pet.pet_species || "Unknown"}</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Age</div>
                <div className="font-semibold">{pet.pet_age || "Unknown"} years</div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Size</div>
                <div className="font-semibold">{pet.pet_size || "Unknown"}</div>
              </div>
            </div>

            {/* Owner Information */}
            {pet.user && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={pet.user.profile_photo || "/sample.png"} />
                      <AvatarFallback>
                        {pet.user.first_name?.[0]}{pet.user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {pet.user.first_name} {pet.user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pet.user.location || "Location not specified"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {pet.user && (
              <div className="flex space-x-3">
                <Button className="flex-1" asChild>
                  <Link href={`mailto:${pet.user.email}?subject=${pet.type === "adoption"
                    ? `Get in touch about adopting ${pet.title}`
                    : `Contact the owner about ${pet.title}`}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {pet.type === "adoption"
                      ? "Contact About Adoption"
                      : "Contact Owner"}
                  </Link>
                </Button>
                {pet.type === "donation" && (
                  <>
                    {!user && (
                      <p className="text-sm text-muted-foreground text-center mb-2">
                        Please login to make a donation
                      </p>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDonationForm(true)}
                      title={!user ? "Please login to make a donation" : "Make a donation"}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {!user ? "Login to Donate" : "Donate"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        {showContactForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Contact Owner</CardTitle>
                <CardDescription>
                  {pet.type === "adoption"
                    ? `Get in touch about adopting ${pet.title}`
                    : `Contact the owner about ${pet.title}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="Your phone number" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder={`Hi! I'm interested in ${pet.type === "adoption" ? "adopting" : "helping"} ${pet.title}...`}
                    rows={4}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowContactForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button className="flex-1">Send Message</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Donation Form */}
        {showDonationForm && pet.type === "donation" && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <DonationForm
              postId={pet.id}
              postTitle={pet.title}
              donationGoal={pet.donation_goal}
              currentAmount={pet.current_amount}
              userId={user?.id || ''}
              onCancel={() => setShowDonationForm(false)}
            />
          </div>
        )}

        {/* Share Section */}
        <div className="mt-16 text-center">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <Share2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="font-heading text-xl">Share {pet.title}</CardTitle>
              <CardDescription>Help {pet.title} find a loving home</CardDescription>
              <div className="flex justify-center space-x-3 mt-6">
                <Button variant="outline">Share on Facebook</Button>
                <Button variant="outline">Share on Twitter</Button>
                <Button variant="outline">Copy Link</Button>
              </div>
            </CardContent>
          </Card>

          <CommentSection postId={pet.id} />
        </div>
      </div>
    </div>
  )
}
