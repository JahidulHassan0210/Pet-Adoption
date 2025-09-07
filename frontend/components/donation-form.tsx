"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Receipt, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import ManualDonationForm from "./manual-donation-form"

interface DonationFormProps {
  postId: string
  postTitle: string
  donationGoal?: number
  currentAmount?: number
  userId: string
  onCancel: () => void
}

export default function DonationForm({ 
  postId, 
  postTitle, 
  donationGoal, 
  currentAmount = 0, 
  userId, 
  onCancel 
}: DonationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    amount: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount) {
      setError("Please fill in all required fields")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (donationGoal && currentAmount + amount > donationGoal) {
      setError(`Donation amount exceeds the goal. Maximum remaining: $${donationGoal - currentAmount}`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Store donation data in localStorage and redirect to mock payment page
      const donationData = {
        amount: amount,
        petId: postId,
        petName: postTitle,
        userId: userId,
        message: formData.message
      }
      
      localStorage.setItem('mockPaymentData', JSON.stringify(donationData))
      router.push('/mock-payment')
    } catch (err: any) {
      setError("Failed to proceed to payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const remainingAmount = donationGoal ? donationGoal - currentAmount : 0
  const progressPercentage = donationGoal ? (currentAmount / donationGoal) * 100 : 0

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Make a Donation</CardTitle>
        <CardDescription>
          Support {postTitle} and help make a difference
        </CardDescription>
      </CardHeader>

      <CardContent>
        {donationGoal && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                ${currentAmount} of ${donationGoal}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {remainingAmount > 0 ? `$${remainingAmount} still needed` : 'Goal reached!'}
            </p>
          </div>
        )}

        <Tabs defaultValue="online" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="online" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Online Payment
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Upload Receipt
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="online" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Donation Amount (USD) *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
                className="pl-10"
              />
            </div>
            {donationGoal && remainingAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                Suggested: ${Math.min(remainingAmount, 50)} or any amount you're comfortable with
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Leave a message of support or encouragement..."
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Redirecting..." : "Proceed to Payment"}
            </Button>
          </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💳 Online Payment</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• This form collects your donation details before proceeding to payment</li>
                <li>• You'll be redirected to a secure payment page to complete your donation</li>
                <li>• All donations go directly to helping the pet in need</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <ManualDonationForm 
              postId={postId} 
              postTitle={postTitle} 
              onSuccess={onCancel}
              onCancel={onCancel}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
