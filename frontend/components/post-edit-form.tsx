"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Save, Eye } from "lucide-react"
import api from "@/lib/api"
import type { Post } from "@/types"

interface PostEditFormProps {
  post: Post
  onSave: (updatedPost: Post) => void
  onCancel: () => void
}

export default function PostEditForm({ post, onSave, onCancel }: PostEditFormProps) {
  const [formData, setFormData] = useState({
    title: post.title || "",
    description: post.description || "",
    type: post.type || "adoption",
    donation_goal: post.donation_goal?.toString() || "",
    pet_age: post.pet_age || "",
    pet_breed: post.pet_breed || "",
    pet_gender: post.pet_gender || "",
    location: post.location || "",
    contact_info: post.contact_info || "",
    special_requirements: post.special_requirements || "",
  })
  
  const [newImages, setNewImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState(post.images || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB")
        return false
      }
      if (!file.type.startsWith('image/')) {
        setError("Please upload valid image files")
        return false
      }
      return true
    })
    
    setNewImages(prev => [...prev, ...validFiles])
    setError("")
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required")
      return
    }

    if (formData.type === 'donation' && (!formData.donation_goal || Number(formData.donation_goal) <= 0)) {
      setError("Donation goal is required for donation posts")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const submitData = new FormData()
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value)
        }
      })

      // Add new images
      newImages.forEach((image, index) => {
        submitData.append('new_images', image)
      })

      // Add existing images to keep
      submitData.append('existing_images', JSON.stringify(existingImages.map(img => img.id || img.image_url)))

      const response = await api.put(`/posts/${post.id}/edit/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const updatedPost = response.data.data || response.data
      onSave(updatedPost)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Edit Post
            </CardTitle>
            <CardDescription>
              Update your post details and information
            </CardDescription>
          </div>
          <Badge variant={formData.type === 'adoption' ? 'default' : 'secondary'}>
            {formData.type === 'adoption' ? 'Adoption' : 'Donation'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Adorable Golden Retriever needs a home"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Post Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adoption">Pet Adoption</SelectItem>
                  <SelectItem value="donation">Donation Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the pet, their personality, needs, and any special requirements..."
              rows={4}
              required
            />
          </div>

          {formData.type === 'donation' && (
            <div className="space-y-2">
              <Label htmlFor="donation_goal">Donation Goal (USD) *</Label>
              <Input
                id="donation_goal"
                name="donation_goal"
                type="number"
                min="1"
                step="0.01"
                value={formData.donation_goal}
                onChange={handleInputChange}
                placeholder="e.g., 500.00"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pet_age">Pet Age</Label>
              <Input
                id="pet_age"
                name="pet_age"
                value={formData.pet_age}
                onChange={handleInputChange}
                placeholder="e.g., 2 years"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet_breed">Pet Breed</Label>
              <Input
                id="pet_breed"
                name="pet_breed"
                value={formData.pet_breed}
                onChange={handleInputChange}
                placeholder="e.g., Golden Retriever"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet_gender">Pet Gender</Label>
              <Select value={formData.pet_gender} onValueChange={(value) => handleSelectChange('pet_gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Dhaka, Bangladesh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_info">Contact Information</Label>
              <Input
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleInputChange}
                placeholder="e.g., +880 1234 567890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              name="special_requirements"
              value={formData.special_requirements}
              onChange={handleInputChange}
              placeholder="Any special care requirements, medical needs, etc."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Current Images</Label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border">
                      <img 
                        src={`/media/${image.image_url || image.url}`} 
                        alt={`Pet ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No existing images</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Add New Images</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="new-images"
              />
              <Label htmlFor="new-images" className="cursor-pointer">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Click to upload new images
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG up to 5MB each
                </p>
              </Label>
            </div>

            {newImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {newImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-muted/30">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeNewImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
