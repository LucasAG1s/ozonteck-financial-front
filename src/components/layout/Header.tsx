// Header.tsx
import { Menu, LogOut, ChevronDown, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { useCompanies } from '@/hooks/useCompanies'
import { formatCNPJ } from '@/lib/utils'
import { AvatarWithTemporaryUrl } from '../ui/AvatarWithTemporaryUrl'

interface HeaderProps {
  onMenuClick: () => void
  onProfileEditClick: () => void;
}

export function Header({ onMenuClick, onProfileEditClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { companies, selectedCompany, setSelectedCompany } = useCompanies()


  return (
    
      <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>{selectedCompany?.trade_name} - {selectedCompany?.corporate_name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {companies.map((empresa) => (
                <DropdownMenuItem
                  key={empresa.corporate_name}
                  onClick={() => setSelectedCompany(empresa)}
                  className="flex flex-col items-start p-3"
                >
                  <div className="font-medium">{empresa.trade_name} - {empresa.corporate_name}</div>
                  <div className="text-xs text-muted-foreground">CNPJ: {formatCNPJ(empresa.cnpj)}</div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <AvatarWithTemporaryUrl path={user?.avatar} fallback={user?.name?.charAt(0).toUpperCase() ?? 'A'} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault(); 
                  onProfileEditClick(); 
                }}
              >
                <Edit className="mr-2 h-4 w-4" /><span>Editar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>
      </div>
      </header>
  )
}
