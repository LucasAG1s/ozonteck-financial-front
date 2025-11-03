import { createContext, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getCompanies } from "@/lib/services/finance/company.service"
import { ICompany as Company } from "@/interfaces/universal/CompanyInterface"

interface CompaniesContextType {
  companies: Company[]
  selectedCompany: Company | null
  setSelectedCompany: (company: Company) => void
  loading: boolean
}

export const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined)

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const { data: companies = [], isLoading: loading } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: getCompanies,
    staleTime: 1000 * 60 * 15, 
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (companies.length > 0) {
      const storedCompanyId = localStorage.getItem('selectedCompanyId');
      const companyFromStorage = storedCompanyId ? companies.find(c => c.id === Number(storedCompanyId)) : undefined;
      if (!selectedCompany || !companies.some(c => c.id === selectedCompany.id)) {
        setSelectedCompany(companyFromStorage || companies[0]);
      }
    }
  }, [companies, selectedCompany]); 
  
  return (
    <CompaniesContext.Provider value={{ companies, selectedCompany, setSelectedCompany, loading }}>
      {children}
    </CompaniesContext.Provider>
  )
}
