import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCompanies } from '@/hooks/useCompanies'
import { toast } from 'react-toastify'
import { loginSchema, type LoginData as LoginFormData } from '@/lib/services/auth.service'
import { BackgroundLogin } from './BackgrouLogin' 

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { fetchCompanies } = useCompanies()
  const { login, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sessionExpired') == 'true') {
      toast.info("Você foi desconectado. Por favor, realize o login novamente.");
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.login, data.password)
      
      if (success) {
        await fetchCompanies()
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (error:any) {
      setErrorMessage(error.message)
      toast.error(error.message)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"> {/* Removido bg-background daqui */}
    <BackgroundLogin />
      <div className="relative z-10 max-w-md w-full space-y-8"> {/* Mantido z-10 para o formulário */}
        <div className="text-center">
          <div className="flex justify-center">
              <img src="/icon.png" alt="Ícone do Sistema" className="h-20 w-20" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Sistema Financeiro
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça login para acessar sua conta
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className=" border-l-4 border-red-600 text-red-600 p-4 rounded-md mb-4 shadow-md dark:bg-blue-950/30 dark:border-red-400 dark:text-red-300" role="alert">
                <p className="font-medium">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Digite seu login"
                  {...register('login')}
                  className={errors.login ? 'border-red-500' : ''}
                />
                {errors.login && (
                  <p className="text-sm text-red-500">{errors.login.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    {...register('password')}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isValid}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}

export default Login