import { createContext, useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getCompanies } from "@/lib/services/finance/company.service"
import { ICompany as Company } from "@/interfaces/universal/CompanyInterface"

interface CompaniesContextType {
  companies: Company[]
  selectedCompany: Company | null
  setSelectedCompany: (company: Company) => void
  fetchCompanies: () => Promise<any>
  loading: boolean
}

export const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined)

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const { data: companies = [], isLoading: loading, refetch } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: getCompanies,
    staleTime: 1000 * 60 * 60 * 24, 
    enabled: true, 
  });

  const fetchCompanies = useCallback(async () => {
    return await refetch();
  }, [refetch]);

  useEffect(() => {
    if (!loading && companies.length > 0) {
      const storedCompanyId = localStorage.getItem('selectedCompanyId');
      const companyFromStorage = storedCompanyId ? companies.find(c => c.id === Number(storedCompanyId)) : undefined;
      if (!selectedCompany || !companies.some(c => c.id === selectedCompany.id)) {
        setSelectedCompany(companyFromStorage || companies[0]);
      }
    }
  }, [companies, loading]); 
  
  const contextValue = useMemo(() => ({
    companies,
    selectedCompany,
    setSelectedCompany,
    fetchCompanies,
    loading
  }), [companies, selectedCompany, fetchCompanies, loading]);
  
  return (
    <CompaniesContext.Provider value={contextValue}>
      {children}
    </CompaniesContext.Provider>
  )
}
