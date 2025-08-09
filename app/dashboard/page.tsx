"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, MessageCircle, TrendingUp, Heart, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUsername = localStorage.getItem("username")

    if (!token) {
      router.push("/auth/login")
      return
    }

    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      {/* <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">MindSpace</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {username}</span>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header> */}

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Your Safe Space Dashboard</h2>
          <p className="text-gray-600 text-sm sm:text-base">Choose how you'd like to connect and find support today.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link href="/ai-support">
            <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-blue-800 text-lg sm:text-xl">AI Emotional Support</CardTitle>
                    <CardDescription className="text-sm">Talk to our empathetic AI companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Share your feelings in a private, judgment-free space. Get supportive responses and coping strategies.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm">Start Conversation</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/community">
            <Card className="border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-purple-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  <div>
                    <CardTitle className="text-purple-800 text-lg sm:text-xl">Community Forum</CardTitle>
                    <CardDescription className="text-sm">Connect with others who understand</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Share experiences, ask questions, and support others in a safe, anonymous environment.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm">Join Discussion</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">AI Conversations</CardTitle>
              <MessageCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">12</div>
              <p className="text-xs text-green-600">Supportive chats this month</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Community Posts</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">5</div>
              <p className="text-xs text-orange-600">Posts and comments shared</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Support Given</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">23</div>
              <p className="text-xs text-blue-600">Upvotes received from community</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">AI Support Session</p>
                  <p className="text-xs text-gray-600">Discussed coping strategies for anxiety - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Community Interaction</p>
                  <p className="text-xs text-gray-600">Received 3 upvotes on your supportive comment - 1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
