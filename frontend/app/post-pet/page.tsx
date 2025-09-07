"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Heart, Upload, ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"
import { petService } from "@/lib/services"
import { useAuth } from "@/hooks/use-auth"

export default function PostPetPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    pet_type: "",
    pet_species: "",
    pet_age: "",
    pet_size: "",
    donation_goal: "",
    donations_enabled: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedImages([...uploadedImages, ...files])
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      if (!formData.type || !formData.title || !formData.description) {
        setError("Please fill in all required fields")
        return
      }
      setError("")
      setStep(2)
      return
    }

    if (step === 2) {
      if (!formData.pet_type || !formData.pet_species || !formData.pet_age || !formData.pet_size) {
        setError("Please fill in all pet details")
        return
      }
      if (formData.type === "donation" && !formData.donation_goal) {
        setError("Please set a donation goal")
        return
      }
      setError("")
      setStep(3)
      return
    }

    if (uploadedImages.length === 0) {
      setError("Please upload at least one photo")
      return
    }

    setIsLoading(true)
    setError("")

    console.log("Form data state:", formData)
    console.log("Pet size from state:", formData.pet_size)

    try {
      const petFormData = new FormData()
      petFormData.append('type', formData.type)
      petFormData.append('title', formData.title)
      petFormData.append('description', formData.description || '')
      petFormData.append('pet_type', formData.pet_type)
      petFormData.append('pet_species', formData.pet_species)
      petFormData.append('pet_age', formData.pet_age.toString())
      petFormData.append('pet_size', formData.pet_size)
      
      if (formData.type === 'donation' && formData.donation_goal) {
        petFormData.append('donation_goal', formData.donation_goal.toString())
        petFormData.append('donations_enabled', 'true')
      } else {
        petFormData.append('donations_enabled', 'false')
      }

      uploadedImages.forEach((image, index) => {
        petFormData.append(`images`, image)
      })

      console.log("Form data being sent:")
      for (let [key, value] of petFormData.entries()) {
        console.log(`${key}:`, value)
      }

      const response = await petService.create(petFormData)
      console.log("Post created successfully:", response)
      router.push("/pets")
    } catch (err: any) {
      console.error("Error creating post:", err)
      console.error("Error response:", err.response?.data)
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to create post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const progressValue = (step / 3) * 100

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Post a Pet" />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="font-heading font-bold text-4xl text-foreground">Post a Pet</h1>
            <p className="text-xl text-muted-foreground">
              Help a pet find their forever home or get the support they need
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && "Basic Information"}
                {step === 2 && "Pet Details"}
                {step === 3 && "Photos & Review"}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                {step === 1 && "Tell us about your post"}
                {step === 2 && "Pet information"}
                {step === 3 && "Add photos and review"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Start by choosing the type of post and providing basic details"}
                {step === 2 && "Help potential adopters learn about this pet"}
                {step === 3 && "Upload photos and review your post before publishing"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium">
                        Post Type *
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="What type of post is this?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adoption">Adoption - Find a loving home</SelectItem>
                          <SelectItem value="donation">Donation - Need financial support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Post Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., 'Luna needs a loving family' or 'Help Rocky get medical care'"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Tell the story of this pet. Include personality, medical needs, ideal home, etc."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        A detailed description helps potential adopters understand this pet's needs
                      </p>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pet_type" className="text-sm font-medium">
                          Pet Type *
                        </Label>
                        <Select
                          value={formData.pet_type}
                          onValueChange={(value) => handleSelectChange("pet_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dog">Dog</SelectItem>
                            <SelectItem value="Cat">Cat</SelectItem>
                            <SelectItem value="Bird">Bird</SelectItem>
                            <SelectItem value="Rabbit">Rabbit</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pet_size" className="text-sm font-medium">
                          Size *
                        </Label>
                        <Select
                          value={formData.pet_size}
                          onValueChange={(value) => handleSelectChange("pet_size", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (under 25 lbs)</SelectItem>
                            <SelectItem value="medium">Medium (25-60 lbs)</SelectItem>
                            <SelectItem value="large">Large (over 60 lbs)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pet_species" className="text-sm font-medium">
                        Breed/Species *
                      </Label>
                      <Input
                        id="pet_species"
                        name="pet_species"
                        placeholder="e.g., Golden Retriever, Tabby Cat, Mixed Breed"
                        value={formData.pet_species}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pet_age" className="text-sm font-medium">
                        Age (in years) *
                      </Label>
                      <Input
                        id="pet_age"
                        name="pet_age"
                        type="number"
                        placeholder="e.g., 2"
                        value={formData.pet_age}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="30"
                      />
                    </div>

                    {formData.type === "donation" && (
                      <div className="space-y-2">
                        <Label htmlFor="donation_goal" className="text-sm font-medium">
                          Donation Goal (USD) *
                        </Label>
                        <Input
                          id="donation_goal"
                          name="donation_goal"
                          type="number"
                          placeholder="e.g., 2500"
                          value={formData.donation_goal}
                          onChange={handleInputChange}
                          required
                          min="1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Set a realistic goal based on the pet's needs (medical care, food, etc.)
                        </p>
                      </div>
                    )}
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Pet Photos *</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer space-y-2">
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                            <p className="text-sm font-medium">Upload pet photos</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                          </label>
                        </div>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {uploadedImages.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file) || "/sample.png"}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Review */}
                    <div className="bg-card/50 rounded-lg p-6 space-y-4">
                      <h3 className="font-heading font-semibold text-lg">Review Your Post</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Type:</strong> {formData.type === "adoption" ? "Adoption" : "Donation"}
                        </div>
                        <div>
                          <strong>Title:</strong> {formData.title}
                        </div>
                        <div>
                          <strong>Pet:</strong> {formData.pet_species} • {formData.pet_age} years • {formData.pet_size}
                        </div>
                        {formData.type === "donation" && (
                          <div>
                            <strong>Goal:</strong> ${formData.donation_goal}
                          </div>
                        )}
                        <div>
                          <strong>Photos:</strong> {uploadedImages.length} uploaded
                        </div>
                      </div>
                      

                    </div>
                  </>
                )}

                <div className="flex space-x-3">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                      Back
                    </Button>
                  )}
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Publishing..." : step === 3 ? "Publish Post" : "Continue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Check out our{" "}
              <Link href="/posting-guide" className="text-primary hover:underline">
                posting guide
              </Link>{" "}
              or{" "}
              <Link href="/support" className="text-primary hover:underline">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
