"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, ArrowLeft, Share2, Calendar, Clock, User, BookOpen } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { blogService } from "@/lib/services"
import { getMediaUrl } from "@/lib/utils"
import type { Blog } from "@/types"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [blogPost, setBlogPost] = useState<Blog | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchBlogPost(params.id as string)
    }
  }, [params.id])

  const fetchBlogPost = async (id: string) => {
    try {
      setIsLoading(true)
      const post = await blogService.getById(id)
      setBlogPost(post)
      
      // Fetch related posts (same author or similar tags)
      const allPosts = await blogService.getAll()
      const related = allPosts
        .filter(p => p.id !== id && (p.author.id === post.author.id || p.tags?.some(tag => post.tags?.includes(tag))))
        .slice(0, 2)
      setRelatedPosts(related)
    } catch (err: any) {
      setError("Failed to fetch blog post")
      console.error("Error fetching blog post:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Blog" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPage="Blog" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-destructive">{error || "Blog post not found"}</p>
            <Button onClick={() => router.push("/blog")} className="mt-4">Back to Blog</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={blogPost.title} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              {blogPost.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
              {blogPost.title}
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(blogPost.published_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                                  <Avatar className="h-12 w-12">
                      <AvatarImage src={blogPost.author.profile_photo || "/sample.png"} />
                      <AvatarFallback>
                        {blogPost.author.first_name?.[0]}{blogPost.author.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
              <div>
                <div className="font-semibold">
                  {blogPost.author.first_name} {blogPost.author.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(blogPost.published_at)}
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blogPost.image && (
            <div className="mb-8">
              <img
                src={getMediaUrl(blogPost.image)}
                alt={blogPost.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
          </div>

          {/* Author Bio */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={blogPost.author.profile_photo || "/sample.png"} />
                  <AvatarFallback>
                    {blogPost.author.first_name?.[0]}{blogPost.author.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-heading font-bold text-xl mb-2">About {blogPost.author.first_name} {blogPost.author.last_name}</h3>
                  <p className="text-muted-foreground mb-4">
                    {blogPost.author.bio || "Passionate about helping pets find loving homes and sharing knowledge about pet care."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mb-12">
              <h3 className="font-heading font-bold text-2xl mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((post) => (
                  <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img src={getMediaUrl(post.image)} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-heading font-bold text-lg mb-2 line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(post.published_at)}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${post.id}`}>Read More</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Share and Actions */}
          <div className="flex items-center justify-between pt-8 border-t">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Share this article:</span>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blog">Browse More Articles</Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}
