import { createContext, useContext, useState, ReactNode } from 'react';

interface PageLoadingContextType {
  isPageLoading: boolean;
  showPageLoader: () => void;
  hidePageLoader: () => void;
}

const PageLoadingContext = createContext<PageLoadingContextType | undefined>(undefined);

export const usePageLoading = () => {
  const context = useContext(PageLoadingContext);
  if (context === undefined) {
    throw new Error('usePageLoading must be used within a PageLoadingProvider');
  }
  return context;
};

interface PageLoadingProviderProps {
  children: ReactNode;
}

export const PageLoadingProvider = ({ children }: PageLoadingProviderProps) => {
  const [isPageLoading, setIsPageLoading] = useState(false);

  const showPageLoader = () => {
    setIsPageLoading(true);
  };

  const hidePageLoader = () => {
    setIsPageLoading(false);
  };

  return (
    <PageLoadingContext.Provider value={{
      isPageLoading,
      showPageLoader,
      hidePageLoader,
    }}>
      {children}
    </PageLoadingContext.Provider>
  );
};