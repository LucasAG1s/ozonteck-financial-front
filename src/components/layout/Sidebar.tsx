import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Building2,
  ListTree,
  Building,
  TrendingUp,
  Wallet,
  TrendingDown,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  X,
  Home,
  Truck,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

type NavItem = {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: Omit<NavItem, 'children'>[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Planos de Contas', href: '/account-plans', icon: ListTree },
  { name: 'Empresas', href: '/companies', icon: Building2 },
  { name: 'Entradas', href: '/entries', icon: TrendingUp },
  { name: 'Saídas', href: '/expenses', icon: TrendingDown },
  { name: 'Fluxo de Caixa', href: '/cash-flow', icon: Wallet },
  { name: 'DRE Gerencial', href: '/dre', icon: BarChart3 },
  { name: 'Colaboradores', href: '/employees', icon: Users },
  { name: 'Fornecedores', href: '/suppliers', icon: Truck },
  { name: 'Pagamentos', icon: CreditCard, children: [
    { name: 'Funcionários', href: '/payments/employees', icon: Users },]
  },
  { name: 'Integrações', href: '/integracoes', icon: Building },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Usuários', href: '/usuarios', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
    const activeSubmenu = navigation.find(item => item.children?.some(child => location.pathname.startsWith(child.href!)));
    return activeSubmenu ? { [activeSubmenu.name]: true } : {};
  });

  const handleSubmenuToggle = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onClose}
        />
      )}
      
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
              if (item.children) {
                const isSubmenuActive = item.children.some(child => location.pathname.startsWith(child.href!));
                const isSubmenuOpen = openSubmenus[item.name];
                return (
                  <div key={item.name} className="mb-1">
                    <button
                      onClick={() => handleSubmenuToggle(item.name)}
                      className={cn(
                        "group flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isSubmenuActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transform transition-transform", isSubmenuOpen && "rotate-180")} />
                    </button>
                    {isSubmenuOpen && (
                      <div className="mt-1 pl-6 space-y-1">
                        {item.children.map(child => {
                          const isChildActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href!}
                              className={cn(
                                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isChildActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                              onClick={onClose}
                            >
                              <child.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href!} className={cn("group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")} onClick={onClose}>
                  <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  )
}