import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { config } from "./lib/config"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // CORS headers
  const origin = request.headers.get("origin")
  if (origin && config.allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
}

export const config_middleware = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
