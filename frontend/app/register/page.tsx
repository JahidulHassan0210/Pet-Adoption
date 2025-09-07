"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Heart, Eye, EyeOff, ArrowLeft, Upload, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nidPhoto: null as File | null,
  })

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long")
        return
      }
      if (!formData.username.trim()) {
        setError("Username is required")
        return
      }
      setError("")
      setStep(2)
      return
    }

    if (!formData.nidPhoto) {
      setError("Please upload your NID photo")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const userData = new FormData()
      userData.append('username', formData.username)
      userData.append('first_name', formData.first_name)
      userData.append('last_name', formData.last_name)
      userData.append('email', formData.email)
      userData.append('password', formData.password)
      userData.append('nid_photo', formData.nidPhoto)

      await register(userData)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({
        ...formData,
        nidPhoto: file,
      })
    }
  }

  const progressValue = step === 1 ? 50 : 100

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-2xl text-foreground">PawsConnect</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-bold text-3xl text-foreground">Join Our Community</h1>
            <p className="text-muted-foreground">Create your account to start helping pets find homes</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {step} of 2</span>
            <span>{step === 1 ? "Account Details" : "Verification"}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Registration Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="font-heading text-2xl text-center">
              {step === 1 ? "Create Account" : "Verify Identity"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? "Enter your basic information to get started"
                : "Upload your NID photo for account verification"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nidPhoto" className="text-sm font-medium">
                      National ID Photo
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        id="nidPhoto"
                        name="nidPhoto"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <label htmlFor="nidPhoto" className="cursor-pointer space-y-2">
                        {formData.nidPhoto ? (
                          <div className="space-y-2">
                            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
                            <p className="text-sm font-medium text-primary">{formData.nidPhoto.name}</p>
                            <p className="text-xs text-muted-foreground">Click to change file</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                            <p className="text-sm font-medium">Upload your NID photo</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This helps us verify your identity and keep our community safe
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {step === 2 && (
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : step === 1 ? "Continue" : "Create Account"}
                </Button>
              </div>
            </form>

            {step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
