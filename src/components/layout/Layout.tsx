import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'


export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCNPJ, setSelectedCNPJ] = useState('12.345.678/0001-90')

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          selectedCNPJ={selectedCNPJ}
          onCNPJChange={setSelectedCNPJ}
        />
        
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}