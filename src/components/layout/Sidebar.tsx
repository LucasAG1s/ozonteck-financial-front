import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Building2,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  X,
  Home,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Empresas', href: '/empresas', icon: Building2 },
  { name: 'Entradas', href: '/entradas', icon: TrendingUp },
  { name: 'Saídas', href: '/saidas', icon: TrendingDown },
  { name: 'DRE Gerencial', href: '/dre', icon: BarChart3 },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'Colaboradores', href: '/colaboradores', icon: Users },
  { name: 'Fornecedores', href: '/fornecedores', icon: Truck },
  { name: 'Pagamentos', href: '/pagamentos', icon: CreditCard },
  { name: 'Integrações', href: '/integracoes', icon: Building2 },
  { name: 'Usuários', href: '/usuarios', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Sistema Financeiro</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}