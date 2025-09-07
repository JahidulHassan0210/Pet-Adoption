"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Phone, Clock, Gift } from "lucide-react"
import api from "@/lib/api"

interface VolunteerDonationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function VolunteerDonationForm({ onSuccess, onCancel }: VolunteerDonationFormProps) {
  const [formData, setFormData] = useState({
    item_type: "",
    description: "",
    quantity: "",
    estimated_value: "",
    pickup_location: "",
    contact_number: "",
    available_times: "",
    special_instructions: ""
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.item_type || !formData.description.trim() || !formData.pickup_location.trim() || !formData.contact_number.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await api.post('/items/volunteer-donations/create/', formData)

      setSuccess("Your donation request has been submitted successfully! A volunteer will contact you soon to arrange pickup.")
      
      // Reset form
      setFormData({
        item_type: "",
        description: "",
        quantity: "",
        estimated_value: "",
        pickup_location: "",
        contact_number: "",
        available_times: "",
        special_instructions: ""
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit donation request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const itemTypeOptions = [
    { value: "food", label: "Pet Food", icon: "🍖" },
    { value: "toys", label: "Pet Toys", icon: "🧸" },
    { value: "accessories", label: "Pet Accessories", icon: "🎀" },
    { value: "mixed", label: "Mixed Items", icon: "📦" }
  ]

  return (
    <Card className="border-0 shadow-xl max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="font-heading text-2xl">Donate Pet Supplies</CardTitle>
        <CardDescription>
          Help pets in need by donating food, toys, or accessories. Our volunteers will collect from your location.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="item_type">What are you donating? *</Label>
            <Select value={formData.item_type} onValueChange={(value) => handleSelectChange('item_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select donation type" />
              </SelectTrigger>
              <SelectContent>
                {itemTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you're donating (e.g., 5 bags of dry dog food, assorted cat toys, etc.)"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g., 5 bags, 10 pieces"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_value">Estimated Value (USD)</Label>
              <Input
                id="estimated_value"
                name="estimated_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimated_value}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Location *
            </Label>
            <Textarea
              id="pickup_location"
              name="pickup_location"
              value={formData.pickup_location}
              onChange={handleInputChange}
              placeholder="Please provide your full address with landmarks for easy pickup"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Number *
            </Label>
            <Input
              id="contact_number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              placeholder="e.g., +880 1234 567890"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="available_times" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available Times
            </Label>
            <Textarea
              id="available_times"
              name="available_times"
              value={formData.available_times}
              onChange={handleInputChange}
              placeholder="When are you available for pickup? (e.g., Weekdays 9 AM - 5 PM, Weekends anytime)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleInputChange}
              placeholder="Any special instructions for our volunteers (e.g., gate code, building floor, etc.)"
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              How it works
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Submit your donation details using this form</li>
              <li>• Our volunteers will review and contact you within 24-48 hours</li>
              <li>• Arrange a convenient pickup time that works for both parties</li>
              <li>• Volunteer will collect the items from your specified location</li>
              <li>• Items will be distributed to pets and shelters in need</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Donation Request"}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Questions? Contact us at support@petadoption.com</p>
        </div>
      </CardContent>
    </Card>
  )
}
