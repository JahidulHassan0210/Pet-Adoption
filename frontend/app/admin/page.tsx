"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, FileText, Store, Trash2, Edit, Eye, Shield, Link } from "lucide-react"
import Navigation from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { adminService, storeService } from "@/lib/services"
import type { User, Post, Comment, Store as StoreType } from "@/types"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    if (user && user.is_staff) {
      fetchData()
    }
  }, [user, activeTab])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      if (activeTab === "users") {
        const response = await adminService.getAllUsers()
        setUsers(response)
      } else if (activeTab === "posts") {
        const response = await adminService.getAllPosts()
        setPosts(response)
      } else if (activeTab === "comments") {
        const response = await adminService.getAllComments()
        setComments(response)
      } else if (activeTab === "stores") {
        const response = await storeService.getAll()
        setStores(response)
      }
    } catch (err) {
      setError("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    
    try {
      await adminService.deleteUser(userId)
      setUsers((users || []).filter(u => u.id !== userId))
      alert("User deleted successfully")
    } catch (err) {
      alert("Failed to delete user")
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const updatedUser = await adminService.toggleUserStatus(userId)
      setUsers((users || []).map(u => u.id === userId ? updatedUser : u))
      alert(`User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      alert("Failed to update user status")
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return
    
    try {
      await adminService.deletePost(postId)
      setPosts((posts || []).filter(p => p.id !== postId))
      alert("Post deleted successfully")
    } catch (err) {
      alert("Failed to delete post")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return
    
    try {
      await adminService.deleteComment(commentId)
      setComments((comments || []).filter(c => c.id !== commentId))
      alert("Comment deleted successfully")
    } catch (err) {
      alert("Failed to delete comment")
    }
  }

  const filteredUsers = (users || []).filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPosts = (posts || []).filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredComments = (comments || []).filter(comment => 
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStores = (stores || []).filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user || !user.is_staff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
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
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="Admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="font-heading font-bold text-4xl text-foreground">Admin Panel</h1>
          <p className="text-xl text-muted-foreground">Manage users, posts, comments, and stores</p>
        </div>



        <div className="space-y-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users ({(users || []).length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              <FileText className="h-4 w-4 mr-2" />
              Posts ({(posts || []).length})
            </TabsTrigger>
            <TabsTrigger value="comments">
              <FileText className="h-4 w-4 mr-2" />
              Comments ({(comments || []).length})
            </TabsTrigger>
            <TabsTrigger value="stores">
              <Store className="h-4 w-4 mr-2" />
              Stores ({(stores || []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-8">
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex space-x-2 mt-1">
                          {user.is_staff && <Badge variant="secondary">Staff</Badge>}
                          {user.is_superuser && <Badge variant="default">Admin</Badge>}
                          {!user.is_active && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-8">
            <div className="grid gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">by {post.user.username}</p>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant={post.type === "adoption" ? "default" : "secondary"}>
                            {post.type}
                          </Badge>
                          <Badge variant={post.status === "active" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-8">
            <div className="grid gap-4">
              {filteredComments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Comment by {comment.user.username}</h3>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stores" className="mt-8">
            <div className="grid gap-4">
              {filteredStores.map((store) => (
                <Card key={store.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{store.name}</h3>
                        <p className="text-sm text-muted-foreground">Owner: {store.owner.username}</p>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant={store.is_active ? "default" : "secondary"}>
                            {store.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        
      </div>
    </div>
  )
}



