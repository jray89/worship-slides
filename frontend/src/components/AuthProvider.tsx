import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { auth, getToken, setToken, clearToken, type SignupData, type User } from '@/lib/api'
import { AuthContext } from '@/hooks/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Only wait on /me when there is a stored token to validate.
  const [loading, setLoading] = useState(() => getToken() !== null)

  useEffect(() => {
    if (!getToken()) return
    auth
      .me()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await auth.login(email, password)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const signup = useCallback(async (signupData: SignupData) => {
    const data = await auth.signup(signupData)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
