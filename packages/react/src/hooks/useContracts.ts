import { useQuery } from '@tanstack/react-query'
import { getActiveContracts } from '@canton-connect/core'
import { useLedgerConfig } from '../providers/CantonProvider.js'
import type { Contract, Template } from '../types/index.js'

export interface UseContractsOptions {
  enabled?: boolean
  refetchInterval?: number
  live?: boolean
}

export interface UseContractsResult<T> {
  data: Contract<T>[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useContracts<T>(
  template: Template<T>,
  options?: UseContractsOptions,
): UseContractsResult<T> {
  const config = useLedgerConfig()
  const interval = options?.live ? (options?.refetchInterval ?? 3000) : options?.refetchInterval

  const query = useQuery<Contract<T>[], Error>({
    queryKey: ['contracts', config.ledgerUrl, template.templateId ?? `${template.moduleName}:${template.entityName}`],
    queryFn: () => getActiveContracts(config, template),
    enabled: options?.enabled ?? true,
    refetchInterval: interval,
  })

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: () => { void query.refetch() },
  }
}
