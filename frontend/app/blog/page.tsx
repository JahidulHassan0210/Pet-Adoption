"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Calendar, ArrowRight, BookOpen, X } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { blogService } from "@/lib/services"
import { getMediaUrl } from "@/lib/utils"
import type { Blog } from "@/types"

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [blogPosts, setBlogPosts] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true)
      const response = await blogService.getAll()
      setBlogPosts(response || [])
    } catch (err: any) {
      console.error("Error fetching blog posts:", err)
      setBlogPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Memoized filtered posts for better performance
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      if (!post) return false
      
      const matchesSearch = searchQuery === "" || 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTopic = selectedTopic === "all" || post.tags?.includes(selectedTopic)
      
      return matchesSearch && matchesTopic
    })
  }, [blogPosts, searchQuery, selectedTopic])

  // Get unique topics from all posts
  const availableTopics = useMemo(() => {
    const topics = new Set<string>()
    blogPosts.forEach(post => {
      post.tags?.forEach(tag => topics.add(tag))
    })
    return Array.from(topics).sort()
  }, [blogPosts])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSelectedTopic("all")
  }

  const hasActiveFilters = searchQuery !== "" || selectedTopic !== "all"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Blog" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Blog" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchBlogPosts} className="mt-4">Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Blog" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-heading font-bold text-4xl text-foreground">Pet Adoption Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert advice, heartwarming stories, and practical tips for pet adoption and care
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => window.location.href = '/blog/create'}
              className="bg-primary hover:bg-primary/90"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Create Blog Post
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, authors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-full sm:w-48 h-11">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearSearch} className="h-11">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <div className="mb-12">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-square overflow-hidden">
                  <img
                    src={getMediaUrl(filteredPosts[0].image)}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge variant="secondary">Featured</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(filteredPosts[0].created_at)}
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-3xl mb-4 leading-tight">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {filteredPosts[0].content?.substring(0, 200) || 'No content available'}...
                  </p>
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={filteredPosts[0].author.profile_photo || "/sample.png"} />
                      <AvatarFallback>
                        {filteredPosts[0].author.first_name?.[0]}{filteredPosts[0].author.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {filteredPosts[0].author.first_name} {filteredPosts[0].author.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">Author</div>
                    </div>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/blog/${filteredPosts[0].id}`}>
                      Read Full Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={getMediaUrl(post.image)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {post.tags?.[0] || "General"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.content?.substring(0, 150) || 'No content available'}...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.profile_photo || "/sample.png"} />
                      <AvatarFallback>
                        {post.author.first_name?.[0]}{post.author.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">
                        {post.author.first_name} {post.author.last_name}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl mb-2">
              {hasActiveFilters ? "No articles found" : "No articles available"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? "Try adjusting your search terms or filters"
                : "Check back later for new articles"
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearSearch} className="mr-2">
                Clear Filters
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/blog">View All Articles</Link>
            </Button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-card border rounded-2xl p-8 text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-heading font-bold text-2xl mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get the latest pet adoption tips, heartwarming stories, and community updates delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="flex-1" />
            <Button>Subscribe</Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-8 text-center text-muted-foreground">
          Showing {filteredPosts.length} of {blogPosts.length} articles
        </div>
      </div>
    </div>
  )
}
