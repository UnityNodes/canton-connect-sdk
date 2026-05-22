import React, { createContext, useContext, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CantonConfig, CantonContextValue } from '../types/index.js'

interface CantonProviderProps {
  config: CantonConfig
  children: React.ReactNode
  queryClient?: QueryClient
}

const CantonContext = createContext<CantonContextValue>({
  config: null,
  isConnected: false,
})

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5_000,
      refetchOnWindowFocus: false,
    },
  },
})

export function CantonProvider({
  config,
  children,
  queryClient = defaultQueryClient,
}: CantonProviderProps) {
  const value: CantonContextValue = useMemo(
    () => ({ config, isConnected: Boolean(config.party) }),
    [config],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <CantonContext.Provider value={value}>
        {children}
      </CantonContext.Provider>
    </QueryClientProvider>
  )
}

export function useCantonContext(): CantonContextValue {
  return useContext(CantonContext)
}

export function useLedgerConfig(): CantonConfig {
  const ctx = useContext(CantonContext)
  if (!ctx.config) throw new Error('useCantonConnect must be used inside <CantonProvider>')
  return ctx.config
}
