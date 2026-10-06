import { createContext } from 'react'
import type { SignupData, User } from '@/lib/api'

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
