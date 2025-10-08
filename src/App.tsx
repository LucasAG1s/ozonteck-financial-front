// App.tsx
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '@/contexts/AuthContext'
import { CompaniesProvider } from '@/contexts/CompaniesContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './features/dashboard/Dashboard'
import { AccountPlans } from './features/accountPlans/AccountPlans'
import { Companies } from './features/companies/Companies'
import { Entries } from './features/entries/Entries'
import { Expenses } from './features/expenses/Expenses'
import { Reports } from './features/relatorios/Relatorios'
import { Colaboradores } from './features/colaboradores/Colaboradores'
import { Pagamentos } from './features/pagamentos/Pagamentos'
import { Integracoes } from './features/integracoes/Integracoes'
import { Usuarios } from './features/users/Users'
import { Suppliers } from './features/suppliers/Suppliers'
import { Login } from './features/auth/Login'
import { DRE } from './features/dre/DRE'
import 'react-toastify/dist/ReactToastify.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CompaniesProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="companies"
                element={
                  <ProtectedRoute requiredPermission="companies">
                    <Companies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account-plans"
                element={
                  <ProtectedRoute requiredPermission="plans">
                    <AccountPlans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="entries"
                element={
                  <ProtectedRoute requiredPermission="entries">
                    <Entries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="expenses"
                element={
                  <ProtectedRoute requiredPermission="expenses">
                    <Expenses />
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
                path="reports"
                element={
                  <ProtectedRoute requiredPermission="reports">
                    <Reports />
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
                path="suppliers"
                element={
                  <ProtectedRoute requiredPermission="suppliers">
                    <Suppliers />
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
            </Route> {/* Fim da rota PAI que contém o Layout */}
            
            {/* Você pode adicionar uma rota de "Não Encontrado" (404) aqui se desejar */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
            
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

export default App;