import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const value = {
    activeSection,
    setActiveSection,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = (): AdminContextProps => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin должен использоваться внутри AdminProvider');
  }
  return context;
}; 