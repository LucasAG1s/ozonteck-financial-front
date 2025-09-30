import { useContext } from "react";
import {CompaniesContext}  from "@/contexts/CompaniesContext";

export function useCompanies() {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error("useCompanies must be used within a CompaniesProvider");
  }
  return context;
}