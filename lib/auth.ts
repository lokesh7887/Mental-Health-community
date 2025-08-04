import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables")
}

if (process.env.NODE_ENV === "production" && JWT_SECRET === "your_dev_secret_here") {
  throw new Error("Development JWT secret detected in production environment")
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET as string) as jwt.JwtPayload
  } catch (error) {
    return null
  }
}

// Define JWTPayload type (customize fields as needed)
export type JWTPayload = {
  [key: string]: any
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "7d" })
}
