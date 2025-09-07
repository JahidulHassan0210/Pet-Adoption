"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Store, ArrowLeft } from "lucide-react"
import Navigation from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { storeService } from "@/lib/services"

export default function CreateStorePage() {
  const [storeName, setStoreName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!storeName) {
      setError("Please enter a store name")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const storeData = {
        name: storeName,
        description
      }

      await storeService.create(storeData)
      
      setSuccess("Store created successfully!")
      setStoreName("")
      setDescription("")
    } catch (err) {
      setError("Failed to create store. Please try again.")
      console.error('Failed to create store:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Please login to create a store</p>
          <Button onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Store" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
          
          <div className="text-center space-y-2">
            <h1 className="font-heading font-bold text-3xl text-foreground">Create New Store</h1>
            <p className="text-muted-foreground">
              Start your own pet store and sell products to the community
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a new store
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Enter store name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your store and what you offer..."
                  rows={4}
                />
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
                {isLoading ? "Creating Store..." : "Create Store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
