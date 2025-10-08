// src/contexts/CompaniesContext.tsx
import { createContext, useEffect, useState } from "react"
import { getCompanies, Company } from "@/lib/services/finance/company.service"

interface CompaniesContextType {
  companies: Company[]
  selectedCompany: Company | null
  setSelectedCompany: (company: Company) => void
  loading: boolean
}

export const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined)

const CACHE_KEY = "companies_cache"
const CACHE_TIME = 1000 * 60 * 15 

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          const now = new Date().getTime()
          if (now - parsed.timestamp < CACHE_TIME) {
            setCompanies(parsed.data)
            setSelectedCompany(parsed.data[0] ?? null)
            setLoading(false)
            return
          }
        }
        const data = await getCompanies()
        setCompanies(data)
        setSelectedCompany(data[0] ?? null)
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: new Date().getTime(), data })
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <CompaniesContext.Provider value={{ companies, selectedCompany, setSelectedCompany, loading }}>
      {children}
    </CompaniesContext.Provider>
  )
}

