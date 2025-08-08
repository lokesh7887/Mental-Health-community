import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, Shield, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header removed — global `Header` is rendered in `app/layout.tsx` */}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">Your Safe Space for Mental Wellness</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect with AI-powered emotional support and a caring community, all while maintaining complete privacy and
            anonymity.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/ai-support">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Talk to AI Support
              </Button>
            </Link>
            <Link href="/community">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 bg-transparent"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-blue-100 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-blue-800">AI Emotional Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Share your feelings with our empathetic AI companion. Get supportive responses and coping strategies
                available 24/7.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-purple-100 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-purple-800">Community Forum</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Connect with others who understand. Share experiences, ask questions, and support each other in a safe
                environment.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-100 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-800">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600">
                Your privacy is our priority. Use pseudonyms, encrypted data, and maintain complete anonymity while
                getting support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl mb-8 text-blue-100">Join thousands who have found support and community in MindSpace</p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
              Create Your Anonymous Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 MindSpace. Your mental health matters. This platform provides peer support, not medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
