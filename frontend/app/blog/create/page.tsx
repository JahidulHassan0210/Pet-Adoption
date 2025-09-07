"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Upload, ArrowLeft, Tag } from "lucide-react"
import Navigation from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { blogService } from "@/lib/services"
import { getMediaUrl } from "@/lib/utils"

export default function CreateBlogPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user } = useAuth()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !content) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

          try {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('content', content)
        
        // Process tags properly
        if (tags.trim()) {
          const processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          formData.append('tags', JSON.stringify(processedTags))
        }
        
        if (image) {
          formData.append('image', image)
        }

        await blogService.create(formData)
      
      setSuccess("Blog post created successfully!")
      setTitle("")
      setContent("")
      setTags("")
      setImage(null)
    } catch (err) {
      setError("Failed to create blog post. Please try again.")
      console.error('Failed to create blog post:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Please login to create blog posts</p>
          <Button onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Blog" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          
          <div className="text-center space-y-2">
            <h1 className="font-heading font-bold text-3xl text-foreground">Create Blog Post</h1>
            <p className="text-muted-foreground">
              Share your knowledge and experiences with the pet adoption community
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Blog Post Information
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a new blog post
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog post title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  rows={12}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter tags separated by commas (e.g., adoption, care, tips)"
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Featured Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    Choose File
                  </Button>
                  {image && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Selected: {image.name}
                      </p>
                      <div className="w-32 h-32 mx-auto border rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-100 p-3 rounded-md">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Blog Post..." : "Create Blog Post"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
