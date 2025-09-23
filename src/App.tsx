// App.tsx
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '@/contexts/AuthContext'
import { CompaniesProvider } from '@/contexts/CompaniesContext' // 👈 importar
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './features/dashboard/Dashboard'
import { Empresas } from './features/empresas/Empresas'
import { Entradas } from './features/entradas/Entradas'
import { Saidas } from './features/saidas/Saidas'
import { Relatorios } from './features/relatorios/Relatorios'
import { Colaboradores } from './features/colaboradores/Colaboradores'
import { Pagamentos } from './features/pagamentos/Pagamentos'
import { Integracoes } from './features/integracoes/Integracoes'
import { Usuarios } from './features/usuarios/Usuarios'
import { Fornecedores } from './features/fornecedores/Fornecedores'
import { Login } from './features/auth/Login'
import { DRE } from './features/dre/DRE'
import 'react-toastify/dist/ReactToastify.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* 👉 Contexto de Empresas englobando tudo que depende do usuário logado */}
        <CompaniesProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="empresas"
                element={
                  <ProtectedRoute requiredPermission="empresas">
                    <Empresas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="entradas"
                element={
                  <ProtectedRoute requiredPermission="entradas">
                    <Entradas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="saidas"
                element={
                  <ProtectedRoute requiredPermission="saidas">
                    <Saidas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dre"
                element={
                  <ProtectedRoute requiredPermission="dre">
                    <DRE />
                  </ProtectedRoute>
                }
              />
              <Route
                path="relatorios"
                element={
                  <ProtectedRoute requiredPermission="relatorios">
                    <Relatorios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="colaboradores"
                element={
                  <ProtectedRoute requiredPermission="colaboradores">
                    <Colaboradores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="fornecedores"
                element={
                  <ProtectedRoute requiredPermission="fornecedores">
                    <Fornecedores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pagamentos"
                element={
                  <ProtectedRoute requiredPermission="pagamentos">
                    <Pagamentos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="integracoes"
                element={
                  <ProtectedRoute requiredPermission="integracoes">
                    <Integracoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="usuarios"
                element={
                  <ProtectedRoute requiredPermission="usuarios">
                    <Usuarios />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </CompaniesProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  )
}

export default App
