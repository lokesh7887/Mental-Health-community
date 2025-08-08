import { useState as reactUseState } from "react"

// Provide a proper implementation using React's useState
function useState<T>(initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  return reactUseState(initialValue)
}

