"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard, Smartphone, Building2, MapPin, Phone } from "lucide-react"
import type { Product, User } from "@/types"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  user: User | null
  onPaymentSuccess: (orderData: any) => void
}

export default function PaymentModal({ isOpen, onClose, product, user, onPaymentSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '$0.00'
    return `$${numPrice.toFixed(2)}`
  }

  const handlePayment = async () => {
    if (!product || !user) return

    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const orderData = {
        id: `order_${Date.now()}`,
        product: product,
        user: user,
        total_amount: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        payment_method: paymentMethod,
        shipping_address: shippingAddress || user.location || 'Not specified',
        phone_number: phoneNumber,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }

      onPaymentSuccess(orderData)
      onClose()
      
    } catch (error) {
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setCardNumber("")
    setExpiryDate("")
    setCvv("")
    setCardName("")
    setPhoneNumber("")
    setShippingAddress("")
    setPaymentMethod("card")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Secure Payment
          </DialogTitle>
          <DialogDescription>
            Complete your purchase for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={product.image ? `/media/${product.image}` : "/sample.png"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.store.name}</p>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(product.price)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Banking
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Banking Form */}
          {paymentMethod === "mobile" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+880 1XXX XXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You will receive a payment link via SMS to complete the transaction.
              </p>
            </div>
          )}

          {/* Bank Transfer Form */}
          {paymentMethod === "bank" && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Bank Details</h4>
                <p className="text-sm">Account: Pet Care Foundation</p>
                <p className="text-sm">Account No: 1234567890</p>
                <p className="text-sm">Bank: BRAC Bank</p>
                <p className="text-sm">Reference: {product.name.substring(0, 10)}...</p>
              </div>
            </div>
          )}

          {/* Shipping Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipping" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </Label>
              <Textarea
                id="shipping"
                placeholder="Enter your complete shipping address..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Number
              </Label>
              <Input
                id="phone"
                placeholder="+880 1XXX XXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                `Pay ${formatPrice(product.price)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
