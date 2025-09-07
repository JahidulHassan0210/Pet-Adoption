"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Eye, Clock, User, DollarSign, FileText, Calendar } from "lucide-react"
import Navigation from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { donationService } from "@/lib/services"
import { getMediaUrl } from "@/lib/utils"
import type { Donation, User } from "@/types"

export default function AdminManualPaymentsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.is_staff) {
      fetchPendingDonations()
    }
  }, [user])

  const fetchPendingDonations = async () => {
    try {
      setIsLoading(true)
      const response = await donationService.getPendingManual()
      setDonations(response)
    } catch (err) {
      setError("Failed to fetch pending donations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = (donation: Donation) => {
    setSelectedDonation(donation)
    setAdminNotes("")
    setIsReviewModalOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedDonation) return

    try {
      setIsProcessing(true)
      await donationService.reviewManual(selectedDonation.id, 'approve', adminNotes)
      setIsReviewModalOpen(false)
      fetchPendingDonations()
      alert("Donation approved successfully!")
    } catch (err) {
      alert("Failed to approve donation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDonation) return

    try {
      setIsProcessing(true)
      await donationService.reviewManual(selectedDonation.id, 'reject', adminNotes)
      setIsReviewModalOpen(false)
      fetchPendingDonations()
      alert("Donation rejected")
    } catch (err) {
      alert("Failed to reject donation")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '$0.00'
    return `$${numAmount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pending donations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="font-heading font-bold text-4xl text-foreground">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Review and approve manual donations submitted by users
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Pending Manual Donations</h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {donations.length} pending
            </Badge>
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-2">No pending donations</h3>
            <p className="text-muted-foreground">All manual donations have been reviewed.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {donations.map((donation) => (
              <Card key={donation.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        {formatPrice(donation.amount)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {donation.donor.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(donation.created_at)}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Donation Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Post:</span> {donation.post.title}</p>
                        <p><span className="font-medium">Payment Method:</span> {donation.payment_method}</p>
                        <p><span className="font-medium">Reference ID:</span> {donation.reference_id}</p>
                        {donation.message && (
                          <p><span className="font-medium">Message:</span> {donation.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Receipt Image</h4>
                      {donation.receipt_image ? (
                        <div className="space-y-2">
                          <img
                            src={getMediaUrl(donation.receipt_image)}
                            alt="Receipt"
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getMediaUrl(donation.receipt_image), '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Image
                          </Button>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No receipt image provided</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleReview(donation)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review Donation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Review Manual Donation
            </DialogTitle>
            <DialogDescription>
              Review the donation details and approve or reject it
            </DialogDescription>
          </DialogHeader>

          {selectedDonation && (
            <div className="space-y-6">
              {/* Donation Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Donation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold text-green-600">{formatPrice(selectedDonation.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Donor</p>
                      <p className="font-semibold">{selectedDonation.donor.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Post</p>
                      <p className="font-semibold">{selectedDonation.post.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reference ID</p>
                      <p className="font-mono text-sm">{selectedDonation.reference_id}</p>
                    </div>
                  </div>
                  
                  {selectedDonation.message && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Message</p>
                      <p className="text-sm">{selectedDonation.message}</p>
                    </div>
                  )}

                  {selectedDonation.receipt_image && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Receipt Image</p>
                      <img
                        src={getMediaUrl(selectedDonation.receipt_image)}
                        alt="Receipt"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label htmlFor="adminNotes" className="text-sm font-medium">
                  Admin Notes (Optional)
                </label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes about this review..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
