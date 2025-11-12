import { createContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/lib/services/auth.service'
import { getPermissions, Permission } from '@/lib/services/permissions.service';
import { User } from '@/interfaces/UserInterface';

export type ProcessedPermissions = {
  'view-dashboard': boolean;
  'view-users-index': boolean;
  'view-company': boolean;
  'create-company': boolean;
  'update-company': boolean;
  'delete-company': boolean;
  'create-user': boolean;
  'update-user-data': boolean;
  'update-user-address': boolean;
  'view-account-plan': boolean;
  'view-account-plan-index': boolean;
  'create-account-plan': boolean;
  'update-account-plan': boolean;
  'delete-account-plan': boolean;
  'view-bank-account-index': boolean;
  'view-bank-account': boolean;
  'create-bank-account': boolean;
  'update-bank-account': boolean;
  'delete-bank-account': boolean;
  'view-financial-transactions': boolean;
  'create-financial-transaction': boolean;
  'update-financial-transaction': boolean;
  'view-dre': boolean;
  'view-financial-entries': boolean;
  'create-financial-entry': boolean;
  'update-financial-entry': boolean;
  'delete-financial-entry': boolean;
  'view-financial-expenses': boolean;
  'create-financial-expense': boolean;
  'update-financial-expense': boolean;
  'delete-financial-expense': boolean;
  'view-suppliers-index': boolean;
  'view-suppliers': boolean;
  'create-supplier': boolean;
  'edit-supplier': boolean;
  'update-supplier-basic-data': boolean;
  'delete-supplier': boolean;
  'update-supplier-data': boolean;
  'update-supplier-address': boolean;
  'update-supplier-bank': boolean;
  'view-employees-index': boolean;
  'create-employee': boolean;
  'delete-employee': boolean;
  'edit-employee': boolean;
  'view-employee-payments': boolean;
};


type AuthenticatedUser = Omit<User, 'permissions'> & {
  permissions: ProcessedPermissions;
};

interface AuthContextType {
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (login: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hasPermission: (permission: keyof ProcessedPermissions) => boolean
}

/**
 * @param allPermissions 
 * @param userPermissions 
 * @returns 
 */
const buildPermissionsObject = (allPermissions: Permission[], userPermissions: Permission[]): ProcessedPermissions => {
  const userPermissionNames = new Set(userPermissions.map(p => p.name));
  
  const permissionsObject = allPermissions.reduce((acc, permission) => {
    acc[permission.name as keyof ProcessedPermissions] = userPermissionNames.has(permission.name);
    return acc;
  }, {} as ProcessedPermissions);

  return permissionsObject;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        const token = localStorage.getItem('authToken')

        if (isAuthenticated === 'true' && token) {
          try {
            const [userProfile, allPermissions] = await Promise.all([
              authService.getProfile(),
              getPermissions()
            ]);
            
            const permissions = buildPermissionsObject(allPermissions, userProfile.permissions);
            const userData: AuthenticatedUser = {
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

  const login = async (login: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const { token } = await authService.login({ login, password })
      
      const [userProfile, allPermissions] = await Promise.all([
        authService.getProfile(),
        getPermissions()
      ]);

      const permissions = buildPermissionsObject(allPermissions, userProfile.permissions);
      
      const userData: AuthenticatedUser = {
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
      
    }
  }

  const hasPermission = (permission: keyof ProcessedPermissions): boolean => {
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