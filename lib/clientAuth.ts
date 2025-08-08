// lib/clientAuth.ts
"use client"


export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
