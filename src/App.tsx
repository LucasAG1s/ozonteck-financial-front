import { Routes, Route, Outlet } from 'react-router-dom'
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
import { Reports } from './features/reports/Reports'
import { Employees } from './features/employees/Employees'
import { EmployeeEditPage } from './features/employees/EmployeeEditPage' 
import { PaymentsEmployees } from './features/payments/PaymentsEmployees'
import { SupplierEditPage } from './features/suppliers/SupplierEditPage'
import { Integracoes } from './features/integracoes/Integracoes'
import { Usuarios } from './features/users/Users'
import { Suppliers } from './features/suppliers/Suppliers'
import { Login } from './features/auth/Login'
import { DRE } from './features/dre/DRE'
import { Transactions } from './features/transactions/Transactions' 
import { BankAccounts } from './features/registers/BankAccounts'
import 'react-toastify/dist/ReactToastify.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NotFoundPage } from './components/layout/NotFoundPage'

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