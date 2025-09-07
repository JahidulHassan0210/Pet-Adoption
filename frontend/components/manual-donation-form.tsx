"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Receipt, DollarSign } from "lucide-react"
import api from "@/lib/api"

interface ManualDonationFormProps {
  postId: string
  postTitle: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ManualDonationForm({ postId, postTitle, onSuccess, onCancel }: ManualDonationFormProps) {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Receipt image must be less than 5MB")
        return
      }
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file")
        return
      }
      setReceiptImage(file)
      setError("")
    }
  }

  const removeImage = () => {
    setReceiptImage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid donation amount")
      return
    }

    if (!receiptImage) {
      setError("Please upload a receipt image")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append('post_id', postId)
      formData.append('amount', amount)
      formData.append('message', message)
      formData.append('receipt_image', receiptImage)

      const response = await api.post('/donations/create-manual/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess("Manual donation submitted successfully! It will be reviewed by an admin.")
      setAmount("")
      setMessage("")
      setReceiptImage(null)
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit donation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Receipt className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="font-heading text-2xl">Manual Donation</CardTitle>
        <CardDescription>
          Submit your donation receipt for {postTitle}
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
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Donation Amount
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount (e.g., 50.00)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Receipt Image
            </Label>
            
            {!receiptImage ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  required
                />
                <Label htmlFor="receipt" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Click to upload receipt image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG up to 5MB
                  </p>
                </Label>
              </div>
            ) : (
              <div className="relative border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{receiptImage.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(receiptImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message with your donation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📋 Important Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your donation will be reviewed by an admin</li>
              <li>• Please ensure the receipt clearly shows the amount and date</li>
              <li>• You will be notified once your donation is approved</li>
              <li>• Only verified donations count toward the goal</li>
            </ul>
          </div>

          <div className="flex gap-3">
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
              {isLoading ? "Submitting..." : "Submit Donation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
