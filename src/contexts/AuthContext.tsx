import { createContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/lib/services/auth.service'
import { toast } from 'react-toastify'

interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string | null
  pivot: {
    model_type: string
    model_id: number
    role_id: number
  }
}

export interface User {
  id: number
  login: string
  name: string
  status: number
  email: string
  email_verified_at: string
  created_at: string
  updated_at: string
  roles: Role[]
  permissions: {
    dashboard: boolean
    plans: boolean
    cashflow: boolean 
    companies: boolean
    entries: boolean
    expenses: boolean
    reports: boolean
    colaboradores: boolean
    dre:boolean
    pagamentos: boolean
    integracoes: boolean
    usuarios: boolean
    suppliers: boolean
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hasPermission: (permission: keyof User['permissions']) => boolean
}

const getPermissionsByRole = (roleName: string) => {
  const rolePermissions: Record<string, User['permissions']> = {
    'master': { 
      dashboard: true,
      plans: true,
      companies: true,
      entries: true,
      expenses: true,
      reports: true,
      colaboradores: true,
      cashflow: true, 
      pagamentos: true,
      integracoes: true,
      usuarios: true,
      suppliers: true,
      dre:true
    },
    'gerente': { 
      dashboard: true,
      plans: true,
      companies: true,
      entries: true,
      expenses: true,
      reports: true,
      colaboradores: true,
      cashflow: true, 
      pagamentos: true,
      integracoes: true,
      usuarios: true,
      suppliers: true,
      dre:true

    },
    'auxiliar': { 
      dashboard: true,
      plans: true,
      companies: true,
      entries: true,
      expenses: true,
      reports: true,
      colaboradores: true,
      cashflow: true, 
      pagamentos: true,
      integracoes: true,
      usuarios: true,
      suppliers: true,
      dre:true

    }
  }
  const normalizedRoleName = roleName.toLowerCase(); 
  return rolePermissions[normalizedRoleName] || rolePermissions['auxiliar'];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        const token = localStorage.getItem('authToken')

        if (isAuthenticated === 'true' && token) {
          try {
            const userProfile = await authService.getProfile()
            const roleName = (userProfile.roles && userProfile.roles.length > 0) ? userProfile.roles[0].name : 'auxiliar';
            const permissions = getPermissionsByRole(roleName);
            
            const userData: User = {
              ...userProfile,
              permissions
            }
            
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } catch (error) {
            const savedUserData = localStorage.getItem('user')
            if (savedUserData) {
              const parsedUser = JSON.parse(savedUserData)
              setUser(parsedUser)
            } else {
              localStorage.removeItem('isAuthenticated')
              localStorage.removeItem('authToken')
              localStorage.removeItem('user')
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error)
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const { token } = await authService.login({ email, password })
      
      const userProfile = await authService.getProfile()
      
      const roleName = (userProfile.roles && userProfile.roles.length > 0) ? userProfile.roles[0].name : 'auxiliar';
      const permissions = getPermissionsByRole(roleName);
      
      const userData: User = {
        ...userProfile,
        permissions
      }

      setUser(userData)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      
      return true
    } catch (error: any) {
      switch (error.status) {
        case 401:
          throw new Error("Credenciais inválidas")
          break
        case 429:
          throw new Error("Muitas tentativas de login. Tente novamente mais tarde.")
          break
        default:
          throw new Error(error?.message || "Erro ao fazer login. tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      navigate('/login')
      
      toast.success("Você foi desconectado com sucesso.")
    }
  }

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return user?.permissions[permission] ?? false
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}