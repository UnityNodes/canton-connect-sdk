import { useQuery } from '@tanstack/react-query'
import { getPackages } from '@canton-connect/core'
import { useLedgerConfig } from '../providers/CantonProvider.js'
import type { CantonPackage } from '../types/index.js'

export interface UsePackagesResult {
  data: CantonPackage[]
  loading: boolean
  error: Error | null
}

export function usePackages(): UsePackagesResult {
  const config = useLedgerConfig()

  const query = useQuery({
    queryKey: ['packages'],
    queryFn: () => getPackages(config),
    staleTime: 60_000,
  })

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
  }
}
