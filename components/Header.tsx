"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isLoggedIn, clearToken } from "@/lib/clientAuth"

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setLoggedIn(isLoggedIn())
  }, [pathname])

  const handleLogout = () => {
    clearToken()
    setLoggedIn(false)
    router.push("/auth/login")
  }

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">MindSpace</h1>
        </div>
        <nav className="flex space-x-2 sm:space-x-4 items-center">
          {!loggedIn ? (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/048/926/084/small_2x/silver-membership-icon-default-avatar-profile-icon-membership-icon-social-media-user-image-illustration-vector.jpg"
                  alt="Profile"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full cursor-pointer"
                />
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
