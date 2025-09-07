"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import api from "@/lib/api"

interface PostUpdateFormProps {
  postId: string
  onUpdate: (updateData: any) => void
  onCancel: () => void
}

export default function PostUpdateForm({ postId, onUpdate, onCancel }: PostUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [updateText, setUpdateText] = useState("")
  const [newImages, setNewImages] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages([...newImages, ...files])
  }

  const removeImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!updateText.trim() && newImages.length === 0) {
      setError("Please provide update text or upload new images")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('update_text', updateText)
      
      newImages.forEach((image, index) => {
        formData.append('new_images', image)
      })

      const response = await api.post(`/posts/${postId}/update/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onUpdate(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to update post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Update Post</CardTitle>
        <CardDescription>
          Share updates about your pet's progress, health, or add new photos
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Update Text</label>
            <Textarea
              placeholder="Share updates about your pet's progress, health status, or any other important information..."
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tell potential adopters or donors about recent developments
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Photos</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="update-image-upload"
                />
                <label htmlFor="update-image-upload" className="cursor-pointer space-y-2">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium">Upload new photos</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                </label>
              </div>
            </div>

            {newImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Update ${index + 1}`}
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

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
