import { Routes, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { lazy, Suspense } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CompaniesProvider } from '@/contexts/CompaniesContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Layout } from './components/layout/Layout'
import 'react-toastify/dist/ReactToastify.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load feature components for better code splitting
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
const AccountPlans = lazy(() => import('./features/accountPlans/AccountPlans').then(m => ({ default: m.AccountPlans })))
const Companies = lazy(() => import('./features/companies/Companies').then(m => ({ default: m.Companies })))
const Entries = lazy(() => import('./features/entries/Entries').then(m => ({ default: m.Entries })))
const Expenses = lazy(() => import('./features/expenses/Expenses').then(m => ({ default: m.Expenses })))
const Reports = lazy(() => import('./features/reports/Reports').then(m => ({ default: m.Reports })))
const Employees = lazy(() => import('./features/employees/Employees').then(m => ({ default: m.Employees })))
const EmployeeEditPage = lazy(() => import('./features/employees/EmployeeEditPage').then(m => ({ default: m.EmployeeEditPage })))
const PaymentsEmployees = lazy(() => import('./features/payments/PaymentsEmployees').then(m => ({ default: m.PaymentsEmployees })))
const SupplierEditPage = lazy(() => import('./features/suppliers/SupplierEditPage').then(m => ({ default: m.SupplierEditPage })))
const Integracoes = lazy(() => import('./features/integracoes/Integracoes').then(m => ({ default: m.Integracoes })))
const Usuarios = lazy(() => import('./features/users/Users').then(m => ({ default: m.Usuarios })))
const Suppliers = lazy(() => import('./features/suppliers/Suppliers').then(m => ({ default: m.Suppliers })))
const Login = lazy(() => import('./features/auth/Login').then(m => ({ default: m.Login })))
const DRE = lazy(() => import('./features/dre/DRE').then(m => ({ default: m.DRE })))
const Transactions = lazy(() => import('./features/transactions/Transactions').then(m => ({ default: m.Transactions })))
const BankAccounts = lazy(() => import('./features/registers/BankAccounts').then(m => ({ default: m.BankAccounts })))
const NotFoundPage = lazy(() => import('./components/layout/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

// Create QueryClient outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CompaniesProvider>
            <Suspense fallback={<LoadingFallback />}>
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
                  <Route
                    index
                    element={
                      <ProtectedRoute requiredPermission="view-dashboard">
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route
                      path="registers/*"
                      element={
                        <ProtectedRoute>
                          <Outlet />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="banks" element={<BankAccounts />} />
                    </Route>
                    <Route
                      path="companies"
                      element={
                        <ProtectedRoute requiredPermission="view-company">
                          <Companies />
                        </ProtectedRoute>
                      }
                    />
                  <Route
                    path="account-plans"
                    element={
                      <ProtectedRoute requiredPermission="view-account-plan-index">
                        <AccountPlans />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="entries"
                    element={
                      <ProtectedRoute requiredPermission="view-financial-entries">
                        <Entries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="expenses"
                    element={
                      <ProtectedRoute requiredPermission="view-financial-expenses">
                        <Expenses />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="transactions"
                    element={
                      <ProtectedRoute requiredPermission="view-financial-transactions">
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="dre"
                    element={
                      <ProtectedRoute requiredPermission="view-dre">
                        <DRE />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="employees/*"
                    element={
                      <ProtectedRoute requiredPermission="view-employees-index">
                        <Outlet />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Employees />} />
                    <Route path="edit/:id" element={<EmployeeEditPage />} />
                  </Route>
                  <Route path="suppliers/*" element={
                      <ProtectedRoute requiredPermission="view-suppliers-index">
                        <Outlet />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Suppliers />} />
                    <Route path="edit/:id" element={<SupplierEditPage />} />
                  </Route>
                  <Route
                    path="payments/*"
                    element={
                      <ProtectedRoute requiredPermission="view-employee-payments">
                        <Outlet />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="employees" element={<PaymentsEmployees />} />
                  </Route>
                  <Route
                    path="integracoes"
                    element={
                      <ProtectedRoute>
                        <Integracoes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="usuarios"
                    element={
                      <ProtectedRoute requiredPermission='view-users-index'>
                        <Usuarios />
                      </ProtectedRoute>
                    }
                  />
                </Route> 
                <Route path="*" element={<NotFoundPage />} />
                
              </Routes>
            </Suspense>
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
    </ErrorBoundary>
  )
}

export default App;