"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { CheckCircle, CreditCard, ArrowLeft, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { donationService } from "@/lib/services"

interface MockPaymentData {
  amount: number
  petId: string
  petName: string
  userId: string
  message?: string
}

export default function MockPaymentPage() {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<MockPaymentData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")

  useEffect(() => {
    const storedData = localStorage.getItem('mockPaymentData')
    if (storedData) {
      setPaymentData(JSON.parse(storedData))
    } else {
      router.push('/pets')
    }
  }, [router])

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert('Please fill in all card details')
      return
    }

    setIsProcessing(true)

    try {
      // Create the donation in the backend
      const donationData = {
        amount: paymentData!.amount,
        post_id: paymentData!.petId,
        payment_method: 'credit_card',
        reference_id: `DEMO_${Date.now()}`,
        message: paymentData!.message || ''
      }

      await donationService.create(donationData)
      
      // Simulate payment processing delay
      setTimeout(() => {
        setIsProcessing(false)
        setIsSuccess(true)
        
        // Clear the stored payment data
        localStorage.removeItem('mockPaymentData')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to create donation:', error)
      alert('Failed to process donation. Please try again.')
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Loading..." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Payment Successful" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <CheckCircle className="h-32 w-32 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Payment Successful!</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Thank you for your donation of ${paymentData.amount} to help {paymentData.petName}!
            </p>
            <p className="text-muted-foreground mb-8">
              Your donation will help provide the care and support needed. You will receive a confirmation email shortly.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/pets')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pets
              </Button>
              <Button onClick={() => router.push(`/pets/${paymentData.petId}`)}>
                View Pet Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Complete Payment" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Complete Your Donation</CardTitle>
              <CardDescription>
                Help {paymentData.petName} get the care they need
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Donation Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Donation Amount:</span>
                  <span className="text-2xl font-bold text-primary">${paymentData.amount}</span>
                </div>

              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payment</p>
                    <p>This is a demo payment page. No real payments will be processed.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()} 
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayment} 
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Pay $${paymentData.amount}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
