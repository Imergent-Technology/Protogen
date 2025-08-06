import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ModalConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
  options?: {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
    backdrop?: boolean;
  };
}

interface ModalContextValue {
  modals: ModalConfig[];
  openModal: (config: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = useCallback((config: Omit<ModalConfig, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const modalConfig: ModalConfig = {
      ...config,
      id,
      options: {
        size: 'md',
        closable: true,
        backdrop: true,
        ...config.options,
      },
    };
    
    setModals(prev => [...prev, modalConfig]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const value: ModalContextValue = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}