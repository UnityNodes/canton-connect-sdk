import { useQuery } from '@tanstack/react-query'
import { getContractById } from '@canton-connect/core'
import { useLedgerConfig } from '../providers/CantonProvider.js'
import type { Contract, Template } from '../types/index.js'

export interface UseContractResult<T> {
  data: Contract<T> | null
  loading: boolean
  error: Error | null
}

export function useContract<T>(
  template: Template<T>,
  contractId: string | null | undefined,
): UseContractResult<T> {
  const config = useLedgerConfig()

  const query = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => getContractById(config, template, contractId!),
    enabled: Boolean(contractId),
  })

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
  }
}
