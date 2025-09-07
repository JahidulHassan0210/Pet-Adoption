"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Trash2, User } from "lucide-react"
import { commentService } from "@/lib/services"
import { Comment } from "@/types"
import { useAuth } from "@/hooks/use-auth"

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const data = await commentService.getByPost(postId)
      setComments(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error('Failed to load comments:', err)
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError("Please login to comment")
      return
    }

    if (!newComment.trim()) {
      setError("Please enter a comment")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const comment = await commentService.create(postId, newComment.trim())
      const commentData = comment.data || comment
      setComments([commentData, ...comments])
      setNewComment("")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      await commentService.delete(commentId)
      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        )}

        {!user && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-2">Please login to post comments</p>
            <Button onClick={() => window.location.href = '/login'}>Login</Button>
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.user?.username || comment.user?.email || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                  {user && (user.id === comment.user?.id || user.is_staff) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
