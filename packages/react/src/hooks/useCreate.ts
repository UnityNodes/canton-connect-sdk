import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createContract } from '@canton-connect/core'
import { useLedgerConfig } from '../providers/CantonProvider.js'
import type { Template } from '../types/index.js'

export interface UseCreateResult<T> {
  create: (payload: T) => Promise<string>
  loading: boolean
  error: Error | null
  reset: () => void
}

export function useCreate<T>(template: Template<T>): UseCreateResult<T> {
  const config = useLedgerConfig()
  const queryClient = useQueryClient()
  const queryKey = template.templateId ?? `${template.moduleName}:${template.entityName}`

  const mutation = useMutation({
    mutationFn: (payload: T) => createContract(config, template, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts', config.ledgerUrl, queryKey] })
    },
  })

  return {
    create: (payload) => mutation.mutateAsync(payload),
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  }
}
