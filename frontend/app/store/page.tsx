"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, ShoppingCart, Star, Package, Truck } from "lucide-react"
import Navigation from "@/components/navigation"
import PaymentModal from "@/components/payment-modal"
import { useAuth } from "@/hooks/use-auth"
import { storeService, productService } from "@/lib/services"
import { getMediaUrl } from "@/lib/utils"
import type { Product, Store } from "@/types"

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStore, setSelectedStore] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setIsHydrated(true)
    fetchStores()
    fetchProducts()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await storeService.getAll()
      setStores(response)
    } catch (err) {
      console.error('Failed to fetch stores:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await productService.getAll()
      setProducts(response)
    } catch (err) {
      setError("Failed to fetch products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const filteredProducts = products.filter((product) => {
    const matchesTab = activeTab === "all" || product.category === activeTab
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesStore = selectedStore === "all" || product.store.id === selectedStore
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesTab && matchesCategory && matchesStore && matchesSearch
  })

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '$0.00'
    return `$${numPrice.toFixed(2)}`
  }

  const handleDirectPayment = (product: Product) => {
    if (!user) {
      alert("Please login to make a purchase")
      return
    }

    setSelectedProduct(product)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (orderData: any) => {
    alert(`Payment successful! Order ID: ${orderData.id}\nYou will receive a confirmation email shortly.`)
    console.log('Order completed:', orderData)
  }

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading store...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading store...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchProducts}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Store" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="font-heading font-bold text-4xl text-foreground">Pet Store</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the best food, toys, and accessories for your beloved pets. Buy directly with secure payment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => window.location.href = '/create-store'}
              className="bg-primary hover:bg-primary/90"
            >
              <Package className="h-4 w-4 mr-2" />
              Create Store
            </Button>
            <Button 
              onClick={() => window.location.href = '/add-product'}
              className="bg-primary hover:bg-primary/90"
            >
              <Package className="h-4 w-4 mr-2" />
              Add to Store
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/blog/create'}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Star className="h-4 w-4 mr-2" />
              Create Blog Post
            </Button>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-11"
              />
            </div>
            <Button variant="outline" onClick={handleSearch} className="md:w-auto bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="toy">Toys</SelectItem>
                <SelectItem value="accessory">Accessories</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedStore("all")
                fetchProducts()
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="all">All ({products.length})</TabsTrigger>
            <TabsTrigger value="food">
              Food ({products.filter((p) => p.category === "food").length})
            </TabsTrigger>
            <TabsTrigger value="toy">
              Toys ({products.filter((p) => p.category === "toy").length})
            </TabsTrigger>
            <TabsTrigger value="accessory">
              Accessories ({products.filter((p) => p.category === "accessory").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image ? getMediaUrl(product.image) : "/sample.png"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading font-bold text-xl mb-1">{product.name}</h3>
                        <p className="text-muted-foreground text-sm">{product.store.name}</p>
                      </div>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.stock_quantity}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleDirectPayment(product)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={product.stock_quantity === "0" || product.stock_quantity === "Out of Stock"}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        {product.stock_quantity === "0" || product.stock_quantity === "Out of Stock" ? "Out of Stock" : "Buy Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedStore("all")
                    fetchProducts()
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        product={selectedProduct}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
