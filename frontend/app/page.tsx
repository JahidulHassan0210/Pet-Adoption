import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Award, BookOpen, Search, MapPin } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="font-heading font-bold text-5xl lg:text-6xl text-foreground leading-tight">
                  Every Pet Deserves a<span className="text-primary"> Loving Home</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Connect with adorable pets waiting for their forever families. Join our community of pet lovers making
                  a difference, one adoption at a time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8" asChild>
                  <Link href="/pets">
                    <Search className="mr-2 h-5 w-5" />
                    Find Your Pet
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
                  <Link href="/post-pet">
                    <Heart className="mr-2 h-5 w-5" />
                    Help a Pet
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="font-heading font-bold text-3xl text-primary">2,500+</div>
                  <div className="text-sm text-muted-foreground">Pets Adopted</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-3xl text-primary">1,200+</div>
                  <div className="text-sm text-muted-foreground">Happy Families</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-3xl text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Partner Shelters</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                <img
                  src="/happy-family-with-adopted-dog-and-cat-in-warm-home.png"
                  alt="Happy family with adopted pets"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Luna found her home!</div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-heading font-bold text-4xl text-foreground">How PawsConnect Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform makes pet adoption simple, safe, and rewarding for everyone involved.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-heading text-xl">Discover Pets</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Browse through profiles of adorable pets waiting for homes. Filter by type, age, size, and location to
                  find your perfect match.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="font-heading text-xl">Connect & Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Connect with pet owners and shelters. Support pets in need through donations or by sharing their
                  stories with your network.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-heading text-xl">Build Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Join our community of pet lovers. Earn badges for your contributions and help create a world where
                  every pet has a loving home.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Success Stories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-heading font-bold text-4xl text-foreground">Recent Success Stories</h2>
            <p className="text-xl text-muted-foreground">See the happy endings that make our work worthwhile</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Bella",
                type: "Golden Retriever",
                location: "New York",
                image: "/happy-golden-retriever-dog-in-new-home.png",
                story: "Found her forever family after 3 months",
              },
              {
                name: "Whiskers",
                type: "Tabby Cat",
                location: "California",
                image: "/content-tabby-cat-in-cozy-home.png",
                story: "Now living his best life with two kids",
              },
              {
                name: "Rocky",
                type: "Mixed Breed",
                location: "Texas",
                image: "/happy-mixed-breed-dog-with-family.png",
                story: "Rescued and now a therapy dog",
              },
            ].map((pet, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img src={pet.image || "/sample.png"} alt={pet.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-bold text-xl">{pet.title}</h3>
                  <Badge variant="secondary">{pet.type}</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{pet.location}</span>
                  </div>
                  <p className="text-muted-foreground">{pet.story}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-heading font-bold text-4xl text-foreground">Join Our Community of Pet Heroes</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Earn badges and recognition for your contributions to pet welfare. From first-time adopters to
                  seasoned volunteers, everyone plays a vital role.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Award, name: "Pet Guardian", desc: "Successful adopter" },
                  { icon: Heart, name: "Big Fan", desc: "Active supporter" },
                  { icon: Users, name: "Community Leader", desc: "Helpful blogger" },
                  { icon: BookOpen, name: "First Responder", desc: "Quick helper" },
                ].map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-background rounded-lg border">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <badge.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">{badge.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Learn About Badges
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/10 to-accent/10">
                <img
                  src="/diverse-group-of-people-volunteering-at-animal-she.png"
                  alt="Community volunteers"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-heading font-bold text-4xl text-foreground">Ready to Make a Difference?</h2>
          <p className="text-xl text-muted-foreground">
            Whether you're looking to adopt, help a pet in need, or join our community of animal lovers, your journey
            starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/pets">Start Browsing Pets</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/register">Join Our Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <span className="font-heading font-bold text-xl">PawsConnect</span>
              </div>
              <p className="text-muted-foreground">
                Connecting pets with loving families and building a community of animal welfare advocates.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-semibold">For Pet Seekers</h3>
              <div className="space-y-2">
                <Link href="/pets" className="block text-muted-foreground hover:text-primary transition-colors">
                  Browse Pets
                </Link>
                <Link
                  href="/adoption-guide"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Adoption Guide
                </Link>
                <Link
                  href="/success-stories"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Success Stories
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-semibold">For Pet Owners</h3>
              <div className="space-y-2">
                <Link href="/post-pet" className="block text-muted-foreground hover:text-primary transition-colors">
                  Post a Pet
                </Link>
                <Link href="/resources" className="block text-muted-foreground hover:text-primary transition-colors">
                  Resources
                </Link>
                <Link href="/support" className="block text-muted-foreground hover:text-primary transition-colors">
                  Get Support
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Community</h3>
              <div className="space-y-2">
                <Link href="/blog" className="block text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
                <Link href="/badges" className="block text-muted-foreground hover:text-primary transition-colors">
                  Badge System
                </Link>
                <Link href="/volunteer" className="block text-muted-foreground hover:text-primary transition-colors">
                  Volunteer
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PawsConnect. Made with ❤️ for pets and their families.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
