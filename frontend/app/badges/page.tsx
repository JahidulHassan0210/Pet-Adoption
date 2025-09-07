"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Award, Trophy, Star, Zap, Crown, Gem, Target } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"

// Badge system data based on backend specification
const badgeCategories = [
  {
    name: "Adoption & Care",
    description: "Badges for helping pets find homes and providing care",
    badges: [
      {
        id: "pet-guardian",
        name: "Pet Guardian",
        description: "For users who successfully adopt pets through the platform",
        icon: "🏠",
        iconComponent: Crown,
        criteria: "Successfully adopt a pet through PawsConnect",
        rarity: "Common",
        color: "bg-blue-500",
        earned: true,
        progress: 100,
        maxProgress: 1,
      },
      {
        id: "super-helper",
        name: "Super Helper",
        description: "For users who assist with multiple adoptions",
        icon: "⭐",
        iconComponent: Star,
        criteria: "Help facilitate 5+ successful adoptions",
        rarity: "Rare",
        color: "bg-purple-500",
        earned: false,
        progress: 2,
        maxProgress: 5,
      },
      {
        id: "first-responder",
        name: "First Responder",
        description: "For users who quickly respond to urgent adoption needs",
        icon: "🚨",
        iconComponent: Zap,
        criteria: "Respond to 3+ urgent adoption posts within 24 hours",
        rarity: "Uncommon",
        color: "bg-red-500",
        earned: false,
        progress: 1,
        maxProgress: 3,
      },
    ],
  },
  {
    name: "Community Engagement",
    description: "Badges for active participation in the community",
    badges: [
      {
        id: "big-fan",
        name: "Big Fan",
        description: "For users who frequently engage with posts and show support",
        icon: "❤️",
        iconComponent: Heart,
        criteria: "Like and interact with 50+ posts",
        rarity: "Common",
        color: "bg-pink-500",
        earned: true,
        progress: 50,
        maxProgress: 50,
      },
      {
        id: "community-leader",
        name: "Community Leader",
        description: "For users who create helpful blog posts and guide others",
        icon: "👑",
        iconComponent: Crown,
        criteria: "Publish 5+ helpful blog posts or guides",
        rarity: "Rare",
        color: "bg-yellow-500",
        earned: false,
        progress: 2,
        maxProgress: 5,
      },
      {
        id: "loyal-supporter",
        name: "Loyal Supporter",
        description: "For users who have been active for 6+ months",
        icon: "🏆",
        iconComponent: Trophy,
        criteria: "Maintain active account for 6+ months",
        rarity: "Uncommon",
        color: "bg-green-500",
        earned: true,
        progress: 6,
        maxProgress: 6,
      },
    ],
  },
  {
    name: "Donations & Support",
    description: "Badges for financial and material contributions",
    badges: [
      {
        id: "generous-donor",
        name: "Generous Donor",
        description: "For users who make significant monetary contributions",
        icon: "💰",
        iconComponent: Gem,
        criteria: "Donate $500+ to pet medical care",
        rarity: "Rare",
        color: "bg-emerald-500",
        earned: false,
        progress: 150,
        maxProgress: 500,
      },
      {
        id: "item-supporter",
        name: "Item Supporter",
        description: "For users who donate food, toys, and supplies",
        icon: "🎁",
        iconComponent: Target,
        criteria: "Donate 10+ items (food, toys, supplies)",
        rarity: "Common",
        color: "bg-orange-500",
        earned: false,
        progress: 4,
        maxProgress: 10,
      },
      {
        id: "emergency-aid",
        name: "Emergency Aid",
        description: "For users who help with medical emergency posts",
        icon: "🚑",
        iconComponent: Zap,
        criteria: "Contribute to 3+ emergency medical fundraisers",
        rarity: "Uncommon",
        color: "bg-red-600",
        earned: false,
        progress: 1,
        maxProgress: 3,
      },
    ],
  },
  {
    name: "Volunteer & Advocacy",
    description: "Badges for hands-on help and advocacy work",
    badges: [
      {
        id: "volunteer",
        name: "Volunteer",
        description: "For users who actively help with pet care and adoption events",
        icon: "🤝",
        iconComponent: Crown,
        criteria: "Participate in 3+ volunteer events or activities",
        rarity: "Common",
        color: "bg-blue-600",
        earned: false,
        progress: 1,
        maxProgress: 3,
      },
    ],
  },
]

const rarityColors = {
  Common: "text-gray-600 bg-gray-100",
  Uncommon: "text-green-600 bg-green-100",
  Rare: "text-purple-600 bg-purple-100",
  Epic: "text-orange-600 bg-orange-100",
}

export default function BadgesPage() {
  const totalBadges = badgeCategories.reduce((sum, category) => sum + category.badges.length, 0)
  const earnedBadges = badgeCategories.reduce(
    (sum, category) => sum + category.badges.filter((badge) => badge.earned).length,
    0,
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Badges" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="font-heading font-bold text-4xl text-foreground">Badge System</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn recognition for your contributions to pet welfare and community engagement
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{earnedBadges}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-2">{totalBadges}</div>
              <div className="text-sm text-muted-foreground">Total Available</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-accent mb-2">
                {Math.round((earnedBadges / totalBadges) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {badgeCategories.reduce(
                  (sum, category) => sum + category.badges.filter((badge) => badge.rarity === "Rare").length,
                  0,
                )}
              </div>
              <div className="text-sm text-muted-foreground">Rare Badges</div>
            </CardContent>
          </Card>
        </div>

        {/* Badge Categories */}
        <div className="space-y-12">
          {badgeCategories.map((category) => (
            <div key={category.name}>
              <div className="mb-8">
                <h2 className="font-heading font-bold text-3xl text-foreground mb-2">{category.name}</h2>
                <p className="text-muted-foreground text-lg">{category.description}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.badges.map((badge) => {
                  const IconComponent = badge.iconComponent
                  const progressPercentage = (badge.progress / badge.maxProgress) * 100

                  return (
                    <Card
                      key={badge.id}
                      className={`border-0 shadow-lg transition-all hover:shadow-xl ${
                        badge.earned ? "ring-2 ring-primary/20 bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                badge.earned ? badge.color : "bg-muted"
                              }`}
                            >
                              {badge.earned ? (
                                <IconComponent className="h-6 w-6 text-white" />
                              ) : (
                                <IconComponent className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-heading font-bold text-lg">{badge.name}</h3>
                              <BadgeUI
                                variant="outline"
                                className={`text-xs ${rarityColors[badge.rarity as keyof typeof rarityColors]}`}
                              >
                                {badge.rarity}
                              </BadgeUI>
                            </div>
                          </div>
                          {badge.earned && <Award className="h-6 w-6 text-primary" />}
                        </div>

                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{badge.description}</p>

                        <div className="space-y-3">
                          <div className="text-xs text-muted-foreground">
                            <strong>How to earn:</strong> {badge.criteria}
                          </div>

                          {!badge.earned && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-semibold">
                                  {badge.progress} / {badge.maxProgress}
                                </span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}

                          {badge.earned && (
                            <div className="flex items-center text-sm text-primary font-semibold">
                              <Award className="h-4 w-4 mr-2" />
                              Badge Earned!
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="border-0 shadow-xl mt-16 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-8 text-center">
            <Award className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="font-heading font-bold text-3xl mb-4">Start Earning Badges Today!</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
              Join our community and start making a difference in pets' lives. Every action you take helps animals find
              loving homes and gets you closer to earning these meaningful badges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/pets">Find Pets to Help</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent" asChild>
                <Link href="/register">Join the Community</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
